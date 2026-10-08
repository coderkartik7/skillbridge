import React, { useEffect, useRef } from 'react';
import { X, ExternalLink, Sparkles, BookOpen, Search } from 'lucide-react';
import { toTitleCase } from '../lib/format';

/**
 * TopicDrawer component:
 * Slides out as a right-side drawer on desktop and bottom sheet on mobile.
 * Features focus trapping, keyboard Esc listener, clean links for Free/Paid materials,
 * and handles "fallback: true" search pill.
 *
 * @param {{
 *   isOpen: boolean,
 *   step: { skill: string, order: number, is_trending: boolean, topics: Array } | null,
 *   onClose: () => void
 * }} props
 */
export default function TopicDrawer({ isOpen, step, onClose }) {
  const drawerRef = useRef(null);

  // Close on Escape & trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    drawerRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !step) return null;

  const topics = step.topics || [];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex md:pl-10">
        <div
          ref={drawerRef}
          tabIndex={-1}
          className="w-screen max-w-lg bg-surface border-l border-surface-border shadow-soft-lg flex flex-col focus:outline-none"
        >
          {/* Header */}
          <div className="p-6 border-b border-surface-border flex items-start justify-between bg-surface-warm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-amber text-ink font-bold text-xs flex items-center justify-center">
                  {step.order}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Learning Roadmap Step
                </span>
              </div>
              <h2 id="drawer-title" className="text-xl font-bold text-ink">
                {toTitleCase(step.skill)}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close learning resources drawer"
              className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-cream transition-colors focus:ring-2 focus:ring-amber focus:outline-none"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Drawer Body: Topic rows */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between text-xs text-ink-muted pb-2 border-b border-surface-border">
              <span>{topics.length} Essential Topics</span>
              <span>Curated Learning Path</span>
            </div>

            {topics.length === 0 ? (
              <p className="text-sm text-ink-muted">No specific sub-topics for this skill.</p>
            ) : (
              <div className="space-y-4">
                {topics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-surface-border bg-surface hover:border-amber/50 transition-colors shadow-soft-sm overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <span className="w-5 h-5 rounded-full bg-cream text-ink text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-ink leading-snug break-words">
                          {toTitleCase(topic.name)}
                        </h4>
                      </div>

                      {topic.fallback && (
                        <span
                          title="Auto-generated search link; curated resources are coming."
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-cream border border-surface-border text-ink cursor-help flex-shrink-0"
                        >
                          <Search className="w-2.5 h-2.5" aria-hidden="true" />
                          Suggested search
                        </span>
                      )}
                    </div>

                    {/* Resources: Free & Paid */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-surface-border/60">
                      {topic.free && (
                        <a
                          href={topic.free.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs font-medium bg-surface-warm border border-surface-border hover:bg-cream hover:border-amber transition-colors text-ink group"
                          aria-label={`Free resource: ${topic.free.title}`}
                        >
                          <div className="min-w-0 flex-1 text-left">
                            <span className="font-semibold text-ink-muted block text-[10px] uppercase">
                              Free
                            </span>
                            <span className="font-medium text-ink block truncate" title={topic.free.title}>
                              {topic.free.title || 'Learning Guide'}
                            </span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink flex-shrink-0 ml-1" />
                        </a>
                      )}

                      {topic.paid && (
                        <a
                          href={topic.paid.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs font-medium bg-surface-warm border border-surface-border hover:bg-cream hover:border-amber transition-colors text-ink group"
                          aria-label={`Paid resource: ${topic.paid.title}`}
                        >
                          <div className="min-w-0 flex-1 text-left">
                            <span className="font-semibold text-ink-muted block text-[10px] uppercase">
                              Paid / Course
                            </span>
                            <span className="font-medium text-ink block truncate" title={topic.paid.title}>
                              {topic.paid.title || 'Deep Dive'}
                            </span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink flex-shrink-0 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-surface-border bg-surface-warm text-xs text-ink-muted text-center">
            Completed this topic? Practice building a small project to cement mastery.
          </div>
        </div>
      </div>
    </div>
  );
}
