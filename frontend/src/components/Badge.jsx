import React from 'react';
import { Flame } from 'lucide-react';
import { getRoleOptionMeta } from '../lib/format';

/**
 * Reusable Badge component conforming strictly to color rules:
 * - Low = amber, Medium = orange, High = coral
 * - Step up = amber, Lateral pivot = orange, Emerging = coral
 * - Never white text on amber/cream/orange/coral
 *
 * @param {{
 *   type?: 'step_up' | 'lateral' | 'emerging' | 'risk_low' | 'risk_medium' | 'risk_high' | 'trending' | 'neutral',
 *   label?: string,
 *   isTrending?: boolean,
 *   size?: 'sm' | 'md',
 *   className?: string
 * }} props
 */
export default function Badge({
  type,
  label,
  isTrending = false,
  size = 'sm',
  className = '',
}) {
  let badgeClasses = 'bg-cream text-ink border-surface-border';
  let displayLabel = label;

  if (type === 'step_up' || type === 'lateral' || type === 'emerging') {
    const meta = getRoleOptionMeta(type);
    badgeClasses = meta.badgeBg;
    displayLabel = label || meta.text;
  } else if (type === 'risk_low') {
    badgeClasses = 'bg-amber/25 text-ink border-amber/40';
    displayLabel = label || 'Low Risk';
  } else if (type === 'risk_medium') {
    badgeClasses = 'bg-orange/25 text-ink border-orange/40';
    displayLabel = label || 'Medium Risk';
  } else if (type === 'risk_high') {
    badgeClasses = 'bg-coral/25 text-ink border-coral/40';
    displayLabel = label || 'High Risk';
  } else if (type === 'trending') {
    badgeClasses = 'bg-coral/20 text-ink border-coral/30';
    displayLabel = label || 'Trending';
    isTrending = true;
  }

  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border shadow-soft-sm ${sizeClass} ${badgeClasses} ${className}`}
    >
      {isTrending && <Flame className="w-3.5 h-3.5 text-coral flex-shrink-0 fill-coral/30" aria-label="Trending skill" />}
      <span>{displayLabel}</span>
    </span>
  );
}
