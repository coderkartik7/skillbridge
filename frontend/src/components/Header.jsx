import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';

/**
 * Slim sticky header with logo wordmark, bridge glyph, and conditional "Start over" button.
 */
export default function Header() {
  const location = useLocation();
  const isInitialStep = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 bg-surface-warm/90 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-ink hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-amber rounded-lg px-1"
          aria-label="SkillBridge Home"
        >
          {/* Amber bridge / arch glyph */}
          <div className="w-8 h-8 rounded-xl bg-cream border border-amber/50 flex items-center justify-center shadow-soft-sm">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1F1B16"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19V12C4 8 7.5 5 12 5C16.5 5 20 8 20 12V19" />
              <path d="M4 19H20" />
              <path d="M9 19V11" />
              <path d="M15 19V11" />
            </svg>
          </div>

          <span className="font-bold text-lg tracking-tight text-ink">
            SkillBridge
          </span>
        </Link>

        {/* Right action: "Start over" appears after Step 1 */}
        <div className="flex items-center gap-4">
          {!isInitialStep && (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-ink bg-cream hover:bg-amber/40 border border-surface-border transition-colors shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-amber"
              aria-label="Start over with a new resume"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Start over</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
