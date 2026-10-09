import os
from pathlib import Path
from dotenv import load_dotenv

# Find and load .env file from ai-backend directory or parent
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

BLS_API_KEY = os.getenv("BLS_API_KEY", "")
BLS_API_BASE_URL = os.getenv("BLS_API_BASE_URL", "https://api.bls.gov/publicAPI/v2/timeseries/data/")
BLS_API_V1_BASE_URL = os.getenv("BLS_API_V1_BASE_URL", "https://api.bls.gov/publicAPI/v1/timeseries/data/")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")