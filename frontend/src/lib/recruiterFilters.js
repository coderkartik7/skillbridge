/**
 * Pure client-side filtering functions for the Recruiter screening results.
 *
 * Requirements:
 * 1. "Show top" segmented control: All, Top 5%, Top 10%, Top 25%, Top 50%
 *    - Filters on candidate.top_percent <= threshold
 * 2. "Minimum experience" slider: 0 to 15 years
 *    - IMPORTANT RULE: Only hide candidates whose years_experience is KNOWN (number) and below the minimum.
 *    - Candidates with unknown experience (years_experience === null || years_experience === undefined)
 *      ALWAYS stay visible!
 * 3. "Minimum skills" number stepper:
 *    - Filters on candidate.skills_count >= minSkills
 * 4. Band chips: "Strong", "Good", "Weak" (multi-select set or array)
 *    - Filters on selectedBands.includes(candidate.band)
 * 5. Rank preserving: Does not alter candidate.rank (the original rank is retained).
 */

export const DEFAULT_RECRUITER_FILTERS = {
  topPercent: 'all', // 'all' | 5 | 10 | 25 | 50
  minExperience: 0,  // 0 to 15
  minSkills: 0,      // >= 0
  bands: ['Strong', 'Good', 'Weak'], // Multi-select
};

/**
 * Filter candidates based on recruiter filter state
 *
 * @param {Array<Object>} candidates
 * @param {Object} filters
 * @param {'all'|number} [filters.topPercent]
 * @param {number} [filters.minExperience]
 * @param {number} [filters.minSkills]
 * @param {string[]} [filters.bands]
 * @returns {Array<Object>}
 */
export function filterCandidates(candidates, filters = {}) {
  if (!Array.isArray(candidates)) return [];

  const topPercent = filters.topPercent ?? DEFAULT_RECRUITER_FILTERS.topPercent;
  const minExperience = Number(filters.minExperience ?? DEFAULT_RECRUITER_FILTERS.minExperience);
  const minSkills = Number(filters.minSkills ?? DEFAULT_RECRUITER_FILTERS.minSkills);
  const selectedBands = Array.isArray(filters.bands) ? filters.bands : DEFAULT_RECRUITER_FILTERS.bands;

  return candidates.filter((candidate) => {
    if (!candidate) return false;

    // 1. Top Percent filter
    if (topPercent !== 'all') {
      const threshold = Number(topPercent);
      if (!Number.isNaN(threshold)) {
        // candidate.top_percent must be <= threshold
        if (typeof candidate.top_percent === 'number' && candidate.top_percent > threshold) {
          return false;
        }
      }
    }

    // 2. Minimum Experience filter
    // CRITICAL: Only hide if years_experience is known AND less than minExperience.
    // Unknown (null, undefined) stays visible!
    if (minExperience > 0) {
      const exp = candidate.years_experience;
      if (exp !== null && exp !== undefined && typeof exp === 'number') {
        if (exp < minExperience) {
          return false;
        }
      }
    }

    // 3. Minimum Skills filter
    if (minSkills > 0) {
      const count = candidate.skills_count ?? 0;
      if (count < minSkills) {
        return false;
      }
    }

    // 4. Band filter
    if (selectedBands.length > 0) {
      if (!selectedBands.includes(candidate.band)) {
        return false;
      }
    } else {
      // If no bands are selected, hide all
      return false;
    }

    return true;
  });
}

/**
 * Checks if current filters deviate from default filters
 *
 * @param {Object} filters
 * @returns {boolean}
 */
export function isFiltered(filters) {
  if (!filters) return false;
  if (filters.topPercent !== 'all') return true;
  if (Number(filters.minExperience || 0) > 0) return true;
  if (Number(filters.minSkills || 0) > 0) return true;
  if (!filters.bands || filters.bands.length !== 3) return true;
  const allBands = ['Strong', 'Good', 'Weak'];
  return !allBands.every((b) => filters.bands.includes(b));
}

/**
 * Generates CSV content from starred or candidate list for pure client-side export
 * CSV columns: rank, name, band, requirements met, years of experience, matched skills
 *
 * @param {Array<Object>} candidates
 * @returns {string}
 */
export function generateShortlistCsv(candidates) {
  const headers = [
    'Rank',
    'Name',
    'Band',
    'Requirements Met',
    'Requirements Total',
    'Years of Experience',
    'Experience Source',
    'Matched Skills',
    'Top Percentile',
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = (candidates || []).map((c) => {
    const expStr =
      c.years_experience !== null && c.years_experience !== undefined
        ? c.years_source === 'stated'
          ? `~${c.years_experience} (stated)`
          : `${c.years_experience}`
        : 'Unknown';

    return [
      escapeCsv(c.rank),
      escapeCsv(c.name),
      escapeCsv(c.band),
      escapeCsv(c.requirements_met),
      escapeCsv(c.requirements_total),
      escapeCsv(expStr),
      escapeCsv(c.years_source || 'unknown'),
      escapeCsv((c.matched_skills || []).join(', ')),
      escapeCsv(`Top ${c.top_percent}%`),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}
