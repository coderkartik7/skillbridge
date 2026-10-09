import React from 'react';
import { Handle, Position } from '@xyflow/react';
import Badge from './Badge';

/**
 * Custom React Flow Node for the Career Map:
 * Can render either the central "current_role" card or a target "option_role" card.
 */
export default function RoleNode({ data }) {
  const { isCurrent, title, code, score, label, is_trending, isSelected, onClick } = data;

  if (isCurrent) {
    return (
      <div
        className="w-[280px] p-5 rounded-2xl bg-surface border-2 border-surface-border shadow-soft flex flex-col justify-between text-left"
        tabIndex={0}
        role="region"
        aria-label={`Current Role: ${title}`}
      >
        <Handle type="source" position={Position.Right} id="right" className="!opacity-0" />
        <Handle type="source" position={Position.Left} id="left" className="!opacity-0" />
        <Handle type="source" position={Position.Top} id="top" className="!opacity-0" />
        <Handle type="source" position={Position.Bottom} id="bottom" className="!opacity-0" />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-ink-muted bg-cream px-2 py-0.5 rounded-md">
              Current Role
            </span>
          </div>
          <h3 className="text-base font-bold text-ink leading-snug line-clamp-2">{title}</h3>
        </div>

        <div className="mt-3 pt-3 border-t border-surface-border text-xs text-ink-muted">
          Anchor point for career transition paths
        </div>
      </div>
    );
  }

  // Target Option Role Node
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Target Role: ${title}, ${score}% match`}
      className={`w-[280px] p-5 rounded-2xl transition-all duration-200 cursor-pointer text-left select-none outline-none ${
        isSelected
          ? 'bg-cream ring-2 ring-ink shadow-soft-lg translate-y-[-2px]'
          : 'bg-surface border border-surface-border hover:-translate-y-1 hover:shadow-soft-lg'
      }`}
    >
      <Handle type="target" position={Position.Left} id="target-left" className="!opacity-0" />
      <Handle type="target" position={Position.Right} id="target-right" className="!opacity-0" />
      <Handle type="target" position={Position.Top} id="target-top" className="!opacity-0" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" className="!opacity-0" />

      {/* Top Header: Badge & Trending */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <Badge type={label} isTrending={is_trending} />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-ink leading-snug mb-3 line-clamp-2">
        {title}
      </h3>

      {/* Match Percentage & Progress Bar */}
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-xs text-ink-muted font-medium">Skill overlap</span>
          <span className="text-xl font-bold text-ink tracking-tight">{score}% <span className="text-xs font-normal text-ink-muted">match</span></span>
        </div>

        {/* Thin progress bar */}
        <div className="w-full h-1.5 bg-surface-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              label === 'step_up' ? 'bg-amber' : label === 'lateral' ? 'bg-orange' : 'bg-coral'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
