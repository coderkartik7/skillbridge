import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';
import { toTitleCase } from '../../lib/format';

/**
 * SkillChips component for candidates:
 * - matched_skills: amber chips
 * - missing_skills: muted outlined chips labeled "Not found in resume", with tooltip "The skill may be described in other words"
 *
 * @param {{ matchedSkills: string[], missingSkills: string[] }} props
 */
export default function SkillChips({ matchedSkills = [], missingSkills = [] }) {
  if (matchedSkills.length === 0 && missingSkills.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Matched skills */}
      {matchedSkills.length > 0 && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber" />
            <span>Supported Skills ({matchedSkills.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.map((skill, idx) => (
              <span
                key={`matched-${skill}-${idx}`}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber text-ink border border-amber/70 shadow-soft-sm"
              >
                {toTitleCase(skill)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing skills */}
      {missingSkills.length > 0 && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1.5 flex items-center gap-1.5">
            <span>Not clearly mentioned in resume ({missingSkills.length})</span>
            <div
              className="relative group cursor-help inline-flex items-center"
              title="The skill may be described in other words"
            >
              <HelpCircle className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-48 p-2 bg-ink text-surface text-[11px] rounded-lg shadow-soft-lg z-20 text-center pointer-events-none">
                The skill may be described in other words
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.map((skill, idx) => (
              <span
                key={`missing-${skill}-${idx}`}
                title="The skill may be described in other words"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-surface text-ink-muted border border-surface-border dashed shadow-soft-sm"
              >
                <span>{toTitleCase(skill)}</span>
                <span className="text-[10px] text-ink-muted/80">(not found)</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
