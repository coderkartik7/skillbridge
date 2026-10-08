import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Flame, BookOpen, ChevronRight } from 'lucide-react';
import { toTitleCase } from '../lib/format';

/**
 * Custom React Flow Node for Roadmap Steps:
 * Displaying order number, skill name in Title Case, trending flame, and topic count.
 */
export default function StepNode({ data }) {
  const { order, skill, is_trending, topics = [], onClick, isCompleted } = data;
  const topicCount = topics?.length || 0;

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
      aria-label={`Step ${order}: ${skill}. ${topicCount} learning topics.`}
      className="group w-[320px] p-4.5 rounded-2xl bg-surface border border-surface-border shadow-soft hover:shadow-soft-lg hover:border-amber transition-all duration-200 cursor-pointer text-left outline-none relative select-none"
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />

      <div className="flex items-start justify-between gap-3">
        {/* Step number circle */}
        <div className="w-8 h-8 rounded-full bg-amber text-ink font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-soft-sm">
          {order}
        </div>

        {/* Skill details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Step {order}
            </span>
            {is_trending && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-coral/20 text-ink border border-coral/30">
                <Flame className="w-3 h-3 text-coral fill-coral/30" aria-hidden="true" />
                Trending
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-ink leading-snug group-hover:text-ink transition-colors">
            {toTitleCase(skill)}
          </h3>

          <div className="mt-2.5 flex items-center justify-between text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              {topicCount} {topicCount === 1 ? 'topic' : 'topics'} to master
            </span>
            <span className="inline-flex items-center gap-0.5 font-medium text-ink group-hover:translate-x-0.5 transition-transform">
              Resources <ChevronRight className="w-3.5 h-3.5 text-amber" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
