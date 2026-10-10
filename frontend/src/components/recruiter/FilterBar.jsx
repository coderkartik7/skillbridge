import React from 'react';
import {
  RotateCcw,
  Info,
  Check,
} from 'lucide-react';
import { isFiltered } from '../../lib/recruiterFilters';

const TOP_PERCENT_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Top 5%', value: 5 },
  { label: 'Top 10%', value: 10 },
  { label: 'Top 25%', value: 25 },
  { label: 'Top 50%', value: 50 },
];

const BANDS = ['Strong', 'Good', 'Weak'];

/**
 * FilterBar component for Recruiter Results:
 * - Sticky top bar
 * - All client-side and instant
 * - Controls:
 *   - "Show top" segmented control: All, Top 5%, Top 10%, Top 25%, Top 50%
 *   - "Minimum experience" slider: 0 to 15 years with helper text: "Candidates with unknown experience stay visible"
 *   - "Minimum skills" stepper on skills_count
 *   - Band chips: Strong, Good, Weak (multi-select, default all on)
 *   - Live line "Showing {visibleCount} of {totalCount}" (with aria-live)
 *   - "Show everyone" reset button when something is hidden
 *   - Small note: "Filters narrow the view. Nobody is rejected."
 *
 * @param {{
 *   filters: Object,
 *   onFiltersChange: (newFilters: Object) => void,
 *   totalCount: number,
 *   visibleCount: number,
 *   onResetFilters: () => void,
 * }} props
 */
export default function FilterBar({
  filters,
  onFiltersChange,
  totalCount,
  visibleCount,
  onResetFilters,
}) {
  const hasHidden = visibleCount < totalCount || isFiltered(filters);

  const handleTopPercentChange = (val) => {
    onFiltersChange({ ...filters, topPercent: val });
  };

  const handleMinExperienceChange = (e) => {
    onFiltersChange({ ...filters, minExperience: Number(e.target.value) });
  };

  const handleMinSkillsChange = (delta) => {
    const nextVal = Math.max(0, (Number(filters.minSkills) || 0) + delta);
    onFiltersChange({ ...filters, minSkills: nextVal });
  };

  const handleBandToggle = (band) => {
    const currentBands = filters.bands || [];
    let updated;
    if (currentBands.includes(band)) {
      // Don't let user deselect all if they want at least 1, or allow 0 with empty view
      updated = currentBands.filter((b) => b !== band);
    } else {
      updated = [...currentBands, band];
    }
    onFiltersChange({ ...filters, bands: updated });
  };

  return (
    <section
      aria-label="Filter candidate results"
      className="sticky top-16 z-30 bg-surface-warm/95 backdrop-blur-md rounded-2xl border border-surface-border p-4 sm:p-5 shadow-soft mb-6 transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-surface-border/70">
        {/* Status Line + Show Everyone button */}
        <div className="flex items-center gap-3">
          <div
            aria-live="polite"
            className="text-xs sm:text-sm font-extrabold text-ink"
          >
            Showing <span className="text-amber-800 font-black">{visibleCount}</span> of {totalCount} candidates
          </div>

          {hasHidden && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-cream hover:bg-amber/40 text-ink border border-surface-border transition-colors shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-amber"
              aria-label="Show everyone and reset filters"
            >
              <RotateCcw className="w-3 h-3 text-ink-muted" />
              <span>Show everyone</span>
            </button>
          )}
        </div>

        {/* Ethical disclaimer note */}
        <div className="text-[11px] sm:text-xs text-ink-muted italic flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber flex-shrink-0" />
          <span>Filters narrow the view. Nobody is rejected.</span>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-4">
        {/* 1. Show Top Segmented Control */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
            Show top percentile
          </label>
          <div
            role="group"
            aria-label="Show top percentile filter"
            className="flex items-center rounded-xl bg-surface border border-surface-border p-1 gap-1"
          >
            {TOP_PERCENT_OPTIONS.map((opt) => {
              const isSelected = filters.topPercent === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleTopPercentChange(opt.value)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all focus:outline-none focus:ring-2 focus:ring-amber ${
                    isSelected
                      ? 'bg-amber text-ink shadow-soft-sm font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-cream/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Minimum Experience Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="min-exp-slider"
              className="text-[11px] font-bold uppercase tracking-wider text-ink-muted"
            >
              Min Experience: <strong className="text-ink text-xs">{filters.minExperience} yrs</strong>
            </label>
          </div>
          <input
            id="min-exp-slider"
            type="range"
            min="0"
            max="15"
            step="1"
            value={filters.minExperience}
            onChange={handleMinExperienceChange}
            aria-label="Minimum years of experience"
            className="w-full accent-amber h-2 bg-surface rounded-lg cursor-pointer border border-surface-border"
          />
          <p className="text-[10px] text-ink-muted mt-1 leading-tight">
            Candidates with unknown experience stay visible
          </p>
        </div>

        {/* 3. Minimum Skills Number Stepper */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
            Min Skills Count
          </label>
          <div className="flex items-center rounded-xl border border-surface-border bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => handleMinSkillsChange(-1)}
              disabled={Number(filters.minSkills) <= 0}
              className="px-3 py-1.5 text-sm font-bold text-ink hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-amber focus:outline-none"
              aria-label="Decrease minimum skills"
            >
              -
            </button>
            <div className="flex-1 text-center font-bold text-xs text-ink py-1.5">
              {filters.minSkills || 0} skills
            </div>
            <button
              type="button"
              onClick={() => handleMinSkillsChange(1)}
              className="px-3 py-1.5 text-sm font-bold text-ink hover:bg-cream transition-colors focus:ring-2 focus:ring-amber focus:outline-none"
              aria-label="Increase minimum skills"
            >
              +
            </button>
          </div>
        </div>

        {/* 4. Fit Bands Multi-Select Chips */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
            Fit Bands
          </label>
          <div className="flex items-center gap-1.5">
            {BANDS.map((band) => {
              const isSelected = (filters.bands || []).includes(band);
              let activeStyle = 'bg-amber text-ink border-amber';
              if (band === 'Good') activeStyle = 'bg-cream text-ink border-ink/40';
              if (band === 'Weak') activeStyle = 'bg-[#EFECE6] text-ink-muted border-[#DDD5C5]';

              return (
                <button
                  key={band}
                  type="button"
                  onClick={() => handleBandToggle(band)}
                  aria-pressed={isSelected}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-amber ${
                    isSelected
                      ? `${activeStyle} shadow-soft-sm`
                      : 'bg-surface text-ink-muted/50 border-surface-border opacity-50 hover:opacity-80'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                  <span>{band}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
