import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional
import requests

from app.core.config import BLS_API_BASE_URL, BLS_API_KEY, BLS_API_V1_BASE_URL

logger = logging.getLogger(__name__)

# Request timeout in seconds
TIMEOUT_SECONDS = 5.0


def _clean_soc_code(occupation_code: str) -> str:
    """
    Extract 6-digit SOC code from O*NET SOC code (e.g., '15-1252.00' -> '151252').
    """
    match = re.search(r"(\d{2})[-]?(\d{4})", occupation_code)
    if match:
        return f"{match.group(1)}{match.group(2)}"
    digits = re.sub(r"\D", "", occupation_code)
    return digits[:6] if len(digits) >= 6 else digits


def _build_bls_series_ids(soc_6digit: str) -> Dict[str, str]:
    """
    Construct BLS OEWS (Occupational Employment and Wage Statistics) survey series IDs.
    OEWS Prefix: 'OE'
    Seasonal adjustment: 'U' (Not Seasonally Adjusted)
    Area Type: 'N' (National)
    Area Code: '0000000' (National)
    Sector/Industry: '000000' (All Industries)
    Occupation Code: soc_6digit (6 digits)
    Data Type: '01' (Employment), '04' (Annual Mean Wage)
    """
    if len(soc_6digit) == 6:
        return {
            "employment": f"OEUN0000000000000{soc_6digit}01",
            "annual_wage": f"OEUN0000000000000{soc_6digit}04",
        }
    return {}


def _calculate_demand_score(employment_count: Optional[float], annual_mean_wage: Optional[float]) -> float:
    """
    Generate normalized demand score (0-100) based on employment level and wage indicators.
    Default baseline score is 50.0 if specific metrics are unavailable.
    """
    score = 50.0

    if employment_count is not None and employment_count > 0:
        if employment_count >= 1_000_000:
            score += 30.0
        elif employment_count >= 500_000:
            score += 20.0
        elif employment_count >= 100_000:
            score += 10.0
        elif employment_count >= 30_000:
            score += 5.0
        else:
            score -= 5.0

    if annual_mean_wage is not None and annual_mean_wage > 0:
        if annual_mean_wage >= 120_000:
            score += 20.0
        elif annual_mean_wage >= 90_000:
            score += 15.0
        elif annual_mean_wage >= 60_000:
            score += 10.0
        elif annual_mean_wage >= 40_000:
            score += 5.0

    return min(max(round(score, 2), 0.0), 100.0)


def _fetch_series_v1(series_id: str) -> tuple[Optional[float], Optional[str]]:
    """
    Fetch single series via BLS Public Data API v1 GET endpoint (no registration required).
    """
    url = f"{BLS_API_V1_BASE_URL.rstrip('/')}/{series_id}"
    try:
        resp = requests.get(url, timeout=TIMEOUT_SECONDS)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "REQUEST_SUCCEEDED":
                series_list = data.get("Results", {}).get("series", [])
                if series_list:
                    data_points = series_list[0].get("data", [])
                    if data_points:
                        latest = data_points[0]
                        val_str = latest.get("value", "")
                        year = latest.get("year", "")
                        period_name = latest.get("periodName", "")
                        period_str = f"{period_name} {year}".strip() if year else None
                        try:
                            return float(val_str.replace(",", "")), period_str
                        except (ValueError, TypeError):
                            pass
    except Exception as e:
        logger.warning("BLS v1 GET failed for %s: %s", series_id, e)
    return None, None


def fetch_live_demand(occupation_code: str) -> Optional[Dict[str, Any]]:
    """
    Fetch real-time labor market & employment data for an occupation from the BLS API.
    Returns a standardized dictionary or None on unrecoverable failures.
    Gracefully catches errors, timeouts, and API rate limits without crashing.
    """
    if not occupation_code or not occupation_code.strip():
        return None

    soc_6digit = _clean_soc_code(occupation_code)
    series_map = _build_bls_series_ids(soc_6digit)

    now_iso = datetime.now(timezone.utc).isoformat()
    current_year = str(datetime.now(timezone.utc).year)
    start_year = str(int(current_year) - 3)

    employment_val: Optional[float] = None
    wage_val: Optional[float] = None
    latest_period: Optional[str] = None
    data_source = "BLS OEWS API"

    if series_map:
        # If API key is provided, prefer v2 POST; otherwise try v1 GET or v2 POST
        fetched = False
        if BLS_API_KEY and BLS_API_BASE_URL:
            try:
                payload: Dict[str, Any] = {
                    "seriesid": list(series_map.values()),
                    "startyear": start_year,
                    "endyear": current_year,
                    "registrationkey": BLS_API_KEY,
                }
                headers = {"Content-type": "application/json"}
                response = requests.post(
                    BLS_API_BASE_URL,
                    json=payload,
                    headers=headers,
                    timeout=TIMEOUT_SECONDS,
                )
                if response.status_code == 200:
                    res_json = response.json()
                    if res_json.get("status") == "REQUEST_SUCCEEDED":
                        for s in res_json.get("Results", {}).get("series", []):
                            s_id = s.get("seriesID")
                            data_points = s.get("data", [])
                            if not data_points:
                                continue
                            latest_point = data_points[0]
                            val_str = latest_point.get("value", "")
                            year = latest_point.get("year", "")
                            period = latest_point.get("periodName", "")
                            if year:
                                latest_period = f"{period} {year}".strip()

                            try:
                                num_val = float(val_str.replace(",", ""))
                                if s_id == series_map.get("employment"):
                                    employment_val = num_val
                                elif s_id == series_map.get("annual_wage"):
                                    wage_val = num_val
                            except (ValueError, TypeError):
                                pass
                        fetched = True
            except Exception as e:
                logger.warning("BLS v2 API request error: %s", e)

        # Fallback to v1 endpoint (reliable public access without API key)
        if not fetched:
            emp_id = series_map.get("employment")
            wage_id = series_map.get("annual_wage")
            if emp_id:
                employment_val, latest_period = _fetch_series_v1(emp_id)
            if wage_id:
                wage_val, wage_period = _fetch_series_v1(wage_id)
                if not latest_period and wage_period:
                    latest_period = wage_period

    # Calculate normalized demand score from live metrics or default baseline
    demand_score = _calculate_demand_score(employment_val, wage_val)

    return {
        "occupation_code": occupation_code,
        "soc_code": soc_6digit,
        "demand_score": demand_score,
        "employment_count": employment_val,
        "annual_mean_wage": wage_val,
        "period": latest_period,
        "source": data_source,
        "updated_at": now_iso,
    }
