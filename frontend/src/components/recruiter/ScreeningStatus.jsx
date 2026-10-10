import React from 'react';
import { CheckCircle2, Shield } from 'lucide-react';
import Spinner from '../Spinner';

const STEPS = [
  { id: 1, label: 'Reading resumes' },
  { id: 2, label: 'Understanding the job description' },
  { id: 3, label: 'Ranking candidates' },
];

/**
 * ScreeningStatus component:
 * - Stepper-style status cycling "Reading resumes", "Understanding the job description", "Ranking candidates"
 * - Progress shimmer bar
 * - Note: "This can take up to 30 seconds for large batches."
 * - Privacy notice: "Resumes are processed in memory and not stored."
 *
 * @param {{ currentStep?: number }} props
 */
export default function ScreeningStatus({ currentStep = 1 }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="p-6 sm:p-8 rounded-2xl bg-surface border border-surface-border shadow-soft max-w-xl mx-auto w-full text-center space-y-6"
    >
      <div className="w-12 h-12 rounded-2xl bg-amber/20 border border-amber/40 flex items-center justify-center mx-auto shadow-soft-sm">
        <Spinner size="md" />
      </div>

      <div>
        <h3 className="text-lg font-extrabold text-ink tracking-tight mb-1">
          Screening Candidates
        </h3>
        <p className="text-xs text-ink-muted">
          Evaluating semantic requirement alignment & extracting evidence.
        </p>
      </div>

      {/* Stepper display */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-md mx-auto">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-amber text-ink border border-amber/80'
                    : isCurrent
                    ? 'bg-cream text-ink ring-2 ring-amber border border-amber/60 animate-pulse'
                    : 'bg-surface-warm text-ink-muted/50 border border-surface-border'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4 text-ink" /> : step.id}
              </div>
              <span
                className={`text-[11px] font-semibold text-center leading-tight ${
                  isCurrent ? 'text-ink font-bold' : 'text-ink-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress shimmer bar */}
      <div className="w-full bg-cream/40 h-2 rounded-full overflow-hidden relative border border-surface-border">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber to-transparent animate-pulse" />
      </div>

      {/* Reassurance notes */}
      <div className="space-y-1.5 pt-2 border-t border-surface-border text-xs text-ink-muted">
        <p className="font-medium text-ink">
          This can take up to 30 seconds for large batches.
        </p>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
          <Shield className="w-3.5 h-3.5 text-amber" />
          <span>Resumes are processed in memory and not stored.</span>
        </div>
      </div>
    </div>
  );
}
