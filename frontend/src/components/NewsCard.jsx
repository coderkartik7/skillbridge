import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';

/**
 * Calculates human relative time string from unix seconds timestamp.
 * e.g. "3h ago", "2d ago", "just now"
 */
function getRelativeTime(unixSeconds) {
  if (!unixSeconds) return 'recent';
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - unixSeconds);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

/**
 * Category badge styling helper.
 */
function getCategoryBadgeStyle(category) {
  switch ((category || '').toLowerCase()) {
    case 'layoff':
      return 'bg-coral/20 border-coral/40 text-ink';
    case 'funding':
    case 'unicorn':
      return 'bg-amber/25 border-amber/40 text-ink';
    case 'package':
      return 'bg-orange/20 border-orange/40 text-ink';
    case 'launch':
      return 'bg-cream border-ink/30 text-ink';
    case 'hiring':
    default:
      return 'bg-surface-warm border-surface-border text-ink-muted';
  }
}

/**
 * NewsCard Component:
 * - Category badge
 * - Title (opens in a new tab)
 * - Summary
 * - Source name and relative time ("3h ago")
 * - "Read source" link
 */
export default function NewsCard({ item }) {
  const { title, link, source, published, category, summary } = item;
  const timeAgo = getRelativeTime(published);

  return (
    <article className="bg-surface rounded-2xl border border-surface-border p-5 sm:p-6 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between gap-4">
      <div>
        {/* Top: Category & Source/Timestamp */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getCategoryBadgeStyle(
              category
            )}`}
          >
            {category}
          </span>

          <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <Clock className="w-3 h-3 text-ink-muted" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-ink leading-snug mb-2 hover:text-amber-900 transition-colors">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="focus:outline-none focus:ring-2 focus:ring-amber rounded"
          >
            {title}
          </a>
        </h3>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">{summary}</p>
      </div>

      {/* Footer Info & Read Source Link */}
      <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs">
        <span className="font-semibold text-ink-muted truncate max-w-[180px]">{source}</span>

        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-ink hover:underline decoration-amber underline-offset-2 focus:outline-none"
        >
          <span>Read source</span>
          <ExternalLink className="w-3 h-3 text-ink-muted" />
        </a>
      </div>
    </article>
  );
}
