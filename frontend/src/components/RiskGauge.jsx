import React from 'react';
import { getRiskTheme } from '../lib/format';

/**
 * Compact, minimalist semicircular risk gauge with plain English description
 *
 * @param {{
 *   score: number, // 0-100, higher = more at risk
 *   label: 'Low' | 'Medium' | 'High' | string
 * }} props
 */
export default function RiskGauge({ score = 0, label = 'Medium' }) {
  const safeScore = Math.min(100, Math.max(0, score || 0));
  const theme = getRiskTheme(label);

  // SVG Semi-circle calculations
  // Arc from (15, 60) through (60, 15) to (105, 60), radius 45
  const radius = 42;
  const strokeWidth = 8;
  const cx = 55;
  const cy = 52;
  const circumference = Math.PI * radius; // Half-circle perimeter
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="flex items-center gap-4 bg-surface p-3.5 px-4 rounded-2xl border border-surface-border shadow-soft-sm">
      <div className="relative w-24 h-14 flex items-center justify-center flex-shrink-0">
        <svg
          viewBox="0 0 110 65"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          {/* Background track */}
          <path
            d="M 13 52 A 42 42 0 0 1 97 52"
            fill="none"
            stroke="#F1E7CC"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active progress arc */}
          <path
            d="M 13 52 A 42 42 0 0 1 97 52"
            fill="none"
            stroke={theme.colorHex}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Numeric score centered inside the arc */}
        <div className="absolute inset-x-0 bottom-0 text-center flex flex-col items-center">
          <span className="text-xl font-bold leading-none text-ink">{safeScore}%</span>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">Layoff Risk:</span>
          <span
            className={`inline-block px-2 py-0.2 font-semibold text-xs rounded-md border ${theme.pillClass}`}
          >
            {label}
          </span>
        </div>
        <p className="text-xs text-ink-muted leading-tight max-w-[200px]">
          Share of your skills not currently trending in the market.
        </p>
      </div>
    </div>
  );
}
