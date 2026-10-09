import React from 'react';
import { Sparkles, BrainCircuit, ArrowRight } from 'lucide-react';

const LEVELS = [
  {
    id: 'easy',
    label: 'Easy',
    helper: 'Basics & definitions',
  },
  {
    id: 'medium',
    label: 'Medium',
    helper: 'Applying concepts',
  },
  {
    id: 'hard',
    label: 'Hard',
    helper: 'Debugging & trade-offs',
  },
];

/**
 * QuizSetup Component:
 * Step 1 setup screen: skill name, segmented control for Easy / Medium / Hard,
 * short helper explanation under each, and primary "Start quiz" button.
 */
export default function QuizSetup({
  skill,
  level = 'easy',
  onSelectLevel,
  onStart,
  isLoading,
}) {
  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto py-4 px-2 sm:px-4 text-center">
      {/* Icon Badge */}
      <div className="w-12 h-12 rounded-2xl bg-cream border border-amber/40 flex items-center justify-center mb-4 shadow-soft-sm">
        <BrainCircuit className="w-6 h-6 text-ink" aria-hidden="true" />
      </div>

      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-cream px-2.5 py-0.5 rounded-md mb-2">
        Knowledge Assessment
      </span>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mb-2">
        {skill}
      </h2>

      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed mb-8 max-w-md">
        Validate your understanding across covered topics with 5 targeted multiple-choice questions tailored to your target milestone.
      </p>

      {/* Segmented Control for Difficulty */}
      <div className="w-full text-left mb-8">
        <label
          id="difficulty-level-label"
          className="block text-xs font-bold text-ink uppercase tracking-wider mb-2.5 text-center"
        >
          Select Difficulty
        </label>

        <div
          role="radiogroup"
          aria-labelledby="difficulty-level-label"
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 bg-surface-warm border border-surface-border rounded-2xl"
        >
          {LEVELS.map((lvl) => {
            const isSelected = level === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectLevel(lvl.id)}
                className={`p-3 rounded-xl text-center transition-all focus:outline-none focus:ring-2 focus:ring-amber ${
                  isSelected
                    ? 'bg-amber text-ink border border-amber/80 shadow-soft-sm font-bold'
                    : 'bg-surface text-ink hover:bg-cream border border-surface-border font-semibold'
                }`}
              >
                <div className="text-sm font-bold text-ink mb-0.5">
                  {lvl.label}
                </div>
                <div className="text-[11px] text-ink-muted leading-snug">
                  {lvl.helper}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onStart}
        disabled={isLoading}
        className="w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-amber hover:bg-amber/90 active:scale-[0.99] font-bold text-sm text-ink shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 disabled:opacity-60"
      >
        <Sparkles className="w-4 h-4 text-ink" aria-hidden="true" />
        <span>Start quiz</span>
        <ArrowRight className="w-4 h-4 text-ink" aria-hidden="true" />
      </button>
    </div>
  );
}
