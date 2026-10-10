import React from 'react';
import { Award, CheckCircle2, ShieldAlert } from 'lucide-react';

/**
 * BandBadge component for candidates:
 * - Strong = amber fill, ink text, check icon
 * - Good = cream fill with ink border, ink text, award icon
 * - Weak = neutral gray / muted fill, shield/info icon
 * - Always includes an icon and the word, not color alone (accessible)
 *
 * @param {{ band: 'Strong' | 'Good' | 'Weak', className?: string }} props
 */
export default function BandBadge({ band, className = '' }) {
  if (band === 'Strong') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber text-ink border border-amber/80 shadow-soft-sm ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-ink flex-shrink-0" aria-hidden="true" />
        <span>Strong fit</span>
      </span>
    );
  }

  if (band === 'Good') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cream text-ink border border-ink/40 shadow-soft-sm ${className}`}
      >
        <Award className="w-3.5 h-3.5 text-ink flex-shrink-0" aria-hidden="true" />
        <span>Good fit</span>
      </span>
    );
  }

  // Weak fit
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#EFECE6] text-ink-muted border border-[#DDD5C5] shadow-soft-sm ${className}`}
    >
      <ShieldAlert className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" aria-hidden="true" />
      <span>Weak fit</span>
    </span>
  );
}
