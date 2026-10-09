import React from 'react';

/**
 * Reusable Circular Progress Ring.
 * @param {number} percent - 0 to 100
 * @param {number} size - pixel dimensions (width/height)
 * @param {number} strokeWidth - thickness of the stroke
 * @param {string} strokeColor - color of the progress bar
 * @param {string} trackColor - background circle color
 * @param {boolean} showLabel - whether to show percentage in the center
 * @param {string} labelClassName - custom classes for the inner percentage text
 */
export default function ProgressRing({
  percent = 0,
  size = 48,
  strokeWidth = 4,
  strokeColor = '#FFCB56', // amber
  trackColor = '#F1E7CC',
  showLabel = true,
  labelClassName = 'text-xs font-bold text-ink',
}) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent || 0)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showLabel && (
        <span className={`absolute select-none ${labelClassName}`}>
          {safePercent}%
        </span>
      )}
    </div>
  );
}
