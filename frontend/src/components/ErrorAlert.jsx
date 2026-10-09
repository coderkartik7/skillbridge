import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Coral-tinted error alert component with optional retry action
 *
 * @param {{ message: string, onRetry?: () => void, className?: string }} props
 */
export default function ErrorAlert({ message, onRetry, className = '' }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`rounded-2xl border border-coral/40 bg-coral/10 p-4 text-ink flex items-start justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm leading-relaxed font-medium">
          {message}
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-coral/30 hover:bg-cream text-ink transition-colors focus:ring-2 focus:ring-amber focus:outline-none"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
