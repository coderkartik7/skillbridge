import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * EmptyState component for 0-option or 0-step states
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   actionText?: string,
 *   onAction?: () => void,
 *   className?: string
 * }} props
 */
export default function EmptyState({
  title,
  description,
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl border border-surface-border bg-surface p-10 text-center max-w-lg mx-auto shadow-soft ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-cream mx-auto flex items-center justify-center mb-4">
        <HelpCircle className="w-6 h-6 text-ink" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed mb-6">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-amber hover:bg-amber/90 text-ink font-semibold text-sm shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
