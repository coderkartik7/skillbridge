import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

/**
 * 404 Not Found Page:
 * Clean, minimalist card matching the design system
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md w-full bg-surface rounded-2xl border border-surface-border p-8 sm:p-10 shadow-soft">
        <div className="w-12 h-12 rounded-2xl bg-cream border border-amber/40 flex items-center justify-center mx-auto mb-4">
          <Compass className="w-6 h-6 text-ink" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-cream px-2 py-0.5 rounded-md">
          404 &bull; Page Not Found
        </span>
        <h1 className="text-2xl font-extrabold text-ink mt-3 mb-2">Off the Career Path</h1>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber hover:bg-amber/90 font-bold text-sm text-ink shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-amber"
        >
          <Home className="w-4 h-4" />
          <span>Return to SkillBridge</span>
        </button>
      </div>
    </div>
  );
}
