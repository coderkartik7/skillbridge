import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toTitleCase } from '../lib/format';

/**
 * SkillChips component showing user's current verified skills
 * Shows first 12 by default, with a clean "+N more" expand toggle
 *
 * @param {{ skills: string[] }} props
 */
export default function SkillChips({ skills = [] }) {
  const [expanded, setExpanded] = useState(false);

  if (!skills || skills.length === 0) return null;

  const initialCount = 12;
  const hasMore = skills.length > initialCount;
  const displayedSkills = expanded ? skills : skills.slice(0, initialCount);
  const remainingCount = skills.length - initialCount;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {displayedSkills.map((skill, idx) => (
        <span
          key={`${skill}-${idx}`}
          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface text-ink border border-surface-border shadow-soft-sm"
        >
          {toTitleCase(skill)}
        </span>
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cream hover:bg-amber/40 text-ink border border-surface-border transition-colors focus:ring-2 focus:ring-amber focus:outline-none"
        >
          {expanded ? (
            <>
              <span>Show less</span>
              <ChevronUp className="w-3 h-3" aria-hidden="true" />
            </>
          ) : (
            <>
              <span>+{remainingCount} more</span>
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
