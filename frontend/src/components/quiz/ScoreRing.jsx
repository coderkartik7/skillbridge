import React from 'react';
import ProgressRing from '../ProgressRing';

/**
 * ScoreRing Component:
 * Wraps ProgressRing to display prominent test results with accessible labels
 * and curated skillbridge theme accents.
 * 
 * @param {number} percent - 0 to 100
 * @param {number} score - correct questions count
 * @param {number} total - total questions count
 * @param {number} size - pixel dimensions (default 96)
 */
export default function ScoreRing({
  percent = 0,
  score = 0,
  total = 0,
  size = 96,
}) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent || 0)));
  const isHighPassing = safePercent >= 80;
  const strokeColor = isHighPassing ? '#FFCB56' : safePercent >= 50 ? '#FFA259' : '#FF7E7E';

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <ProgressRing
        percent={safePercent}
        size={size}
        strokeWidth={7}
        strokeColor={strokeColor}
        trackColor="#F1E7CC"
        showLabel={true}
        labelClassName="text-xl sm:text-2xl font-extrabold text-ink"
      />
      <div className="text-xs sm:text-sm font-bold text-ink">
        {score} of {total} correct
      </div>
    </div>
  );
}
