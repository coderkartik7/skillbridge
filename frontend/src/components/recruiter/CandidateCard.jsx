import React, { useState } from 'react';
import {
  Star,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Code2,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import BandBadge from './BandBadge';
import EvidenceList from './EvidenceList';
import SkillChips from './SkillChips';
import ProfilePanel from './ProfilePanel';

/**
 * CandidateCard component:
 * - Header: rank badge (large numeral), candidate name, band badge, "Top {top_percent}%" pill, star toggle "Shortlist"
 * - Fit meter: "{requirements_met} of {requirements_total} requirements supported" with segmented bar.
 *   NEVER show raw score and never present percentage match.
 * - Facts row: experience ("6.9 years" for dates; "~5 years (stated by candidate)" with info tooltip for stated; "Experience unknown" for null),
 *   skills count, and GitHub/Codeforces handle chips if present.
 * - "Why this ranking" section (expanded for top 3 by default, collapsed otherwise)
 * - Matched & missing skills
 * - "Show developer profile" button toggling ProfilePanel
 *
 * @param {{
 *   candidate: Object,
 *   isStarred: boolean,
 *   onToggleStar: (candidateName: string) => void,
 *   defaultExpandedWhy?: boolean
 * }} props
 */
export default function CandidateCard({
  candidate,
  isStarred = false,
  onToggleStar,
  defaultExpandedWhy = false,
}) {
  const [isWhyExpanded, setIsWhyExpanded] = useState(defaultExpandedWhy);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  if (!candidate) return null;

  const {
    rank,
    top_percent,
    name,
    band,
    requirements_met = 0,
    requirements_total = 1,
    evidence = [],
    unmet = [],
    matched_skills = [],
    missing_skills = [],
    skills_count = 0,
    years_experience,
    years_source,
    handles = {},
  } = candidate;

  // Format candidate name nicely (replace underscores)
  const displayName = name ? name.replace(/_/g, ' ') : 'Candidate';

  // Format experience string
  let expDisplay = 'Experience unknown';
  let expIsStated = false;
  if (years_experience !== null && years_experience !== undefined) {
    if (years_source === 'stated') {
      expDisplay = `~${years_experience} years (stated by candidate)`;
      expIsStated = true;
    } else {
      expDisplay = `${years_experience} years`;
    }
  }

  // Calculate segments for thin segmented bar
  const totalSegments = Math.max(requirements_total, 1);
  const metSegments = Math.min(requirements_met, totalSegments);

  return (
    <div
      className={`rounded-2xl border bg-surface transition-all duration-200 shadow-soft overflow-hidden ${
        isStarred
          ? 'border-amber ring-2 ring-amber/50 shadow-soft-lg'
          : 'border-surface-border hover:border-amber/50'
      }`}
    >
      {/* Top Header */}
      <div className="p-5 sm:p-6 pb-4 border-b border-surface-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Rank + Name + Badges */}
          <div className="flex items-start gap-3.5">
            {/* Rank badge (large numeral) */}
            <div
              className="w-11 h-11 rounded-2xl bg-cream border border-surface-border flex items-center justify-center font-extrabold text-lg text-ink shadow-soft-sm flex-shrink-0"
              aria-label={`Rank #${rank}`}
            >
              #{rank}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-ink tracking-tight">
                  {displayName}
                </h3>
                <BandBadge band={band} />
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-warm text-ink-muted border border-surface-border">
                  Top {top_percent}%
                </span>
              </div>

              {/* Facts summary subtitle */}
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-ink-muted">
                {/* Experience */}
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" />
                  <span className="font-medium text-ink">{expDisplay}</span>
                  {expIsStated && (
                    <div
                      className="relative group cursor-help inline-flex items-center ml-0.5"
                      title="Candidate's own claim, not verified"
                    >
                      <Info className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-48 p-2 bg-ink text-surface text-[11px] rounded-lg shadow-soft-lg z-20 text-center pointer-events-none">
                        Candidate&apos;s own claim, not verified
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-surface-border">•</span>

                {/* Skills count */}
                <div className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" />
                  <span>
                    <strong className="text-ink">{skills_count}</strong> total skills identified
                  </span>
                </div>

                {/* Handle preview tags if available */}
                {(handles?.github || handles?.codeforces || handles?.leetcode) && (
                  <>
                    <span className="text-surface-border">•</span>
                    <div className="flex items-center gap-1.5">
                      {handles.github && (
                        <span className="px-1.5 py-0.5 rounded bg-surface-warm border border-surface-border text-[10px] font-semibold text-ink">
                          gh:{handles.github}
                        </span>
                      )}
                      {handles.codeforces && (
                        <span className="px-1.5 py-0.5 rounded bg-surface-warm border border-surface-border text-[10px] font-semibold text-ink">
                          cf:{handles.codeforces}
                        </span>
                      )}
                      {handles.leetcode && (
                        <span className="px-1.5 py-0.5 rounded bg-surface-warm border border-surface-border text-[10px] font-semibold text-ink">
                          lc:{handles.leetcode}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Shortlist Star Toggle */}
          <button
            type="button"
            onClick={() => onToggleStar && onToggleStar(name)}
            aria-pressed={isStarred}
            aria-label={isStarred ? `Remove ${displayName} from shortlist` : `Add ${displayName} to shortlist`}
            className={`self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-amber ${
              isStarred
                ? 'bg-amber text-ink border border-amber/80 shadow-soft-sm'
                : 'bg-surface text-ink-muted hover:text-ink hover:bg-cream border border-surface-border'
            }`}
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isStarred ? 'fill-ink text-ink' : 'text-ink-muted'
              }`}
            />
            <span>{isStarred ? 'Shortlisted' : 'Shortlist'}</span>
          </button>
        </div>

        {/* Fit Meter: Segmented bar (NO raw scores, NO match percentages) */}
        <div className="mt-4 pt-3 border-t border-surface-border/60">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-ink font-semibold">
              {requirements_met} of {requirements_total} requirements supported
            </span>
            <span className="text-ink-muted text-[11px]">
              Assisted semantic analysis
            </span>
          </div>

          {/* Thin segmented bar */}
          <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-surface-border/40 p-0.5">
            {Array.from({ length: totalSegments }).map((_, i) => {
              const isFilled = i < metSegments;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-all duration-300 ${
                    isFilled ? 'bg-amber' : 'bg-surface-border/60'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Why This Ranking Accordion */}
        <div className="rounded-xl border border-surface-border bg-surface-warm/40 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsWhyExpanded(!isWhyExpanded)}
            aria-expanded={isWhyExpanded}
            className="w-full px-4 py-3 text-left flex items-center justify-between font-bold text-xs text-ink hover:bg-cream/40 transition-colors focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber" />
              <span>Why this ranking</span>
              <span className="text-ink-muted font-normal text-[11px]">
                ({evidence.length} evidence lines)
              </span>
            </div>
            {isWhyExpanded ? (
              <ChevronUp className="w-4 h-4 text-ink-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-ink-muted" />
            )}
          </button>

          {isWhyExpanded && (
            <div className="px-4 pb-4 pt-1 border-t border-surface-border/60">
              <EvidenceList evidence={evidence} unmet={unmet} />
            </div>
          )}
        </div>

        {/* Skills Comparison */}
        <SkillChips matchedSkills={matched_skills} missingSkills={missing_skills} />

        {/* Developer Profile Toggle Button */}
        <div>
          <button
            type="button"
            onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            aria-expanded={isProfileExpanded}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-cream hover:bg-amber/40 text-ink border border-surface-border transition-colors focus:ring-2 focus:ring-amber focus:outline-none shadow-soft-sm"
          >
            <Code2 className="w-4 h-4 text-ink" />
            <span>
              {isProfileExpanded ? 'Hide developer profile' : 'Show developer profile'}
            </span>
            {isProfileExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-ink-muted" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
            )}
          </button>

          {/* Expandable Developer Profile Panel */}
          {isProfileExpanded && (
            <ProfilePanel initialHandles={handles} />
          )}
        </div>
      </div>
    </div>
  );
}
