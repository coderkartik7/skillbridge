import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, AlertTriangle, Send } from 'lucide-react';

/**
 * QuizQuestion Component:
 * - Shows ONE question at a time with smooth framer-motion slide transitions
 * - Progress bar and "Question X of Y"
 * - Small cream pill with the topic name
 * - The question text
 * - 4 large option buttons with keyboard shortcuts 1-4, Enter = Next
 * - Selected option = cream fill + ink 2px outline
 * - Back, Next, and Submit buttons
 * - Unanswered warning confirmation before final submission
 */
export default function QuizQuestion({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswerIndex, // number | undefined
  onSelectOption,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  unansweredCount,
}) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // Keyboard shortcut listener (1-4 select, Enter = next/submit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is focused on an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const optionIdx = parseInt(e.key, 10) - 1;
        if (question.options[optionIdx] !== undefined) {
          onSelectOption(optionIdx);
        }
      } else if (e.key === 'Enter') {
        if (isLast) {
          onSubmit();
        } else {
          onNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, isLast, onSelectOption, onNext, onSubmit]);

  return (
    <div className="max-w-2xl mx-auto py-2">
      {/* Top Progress Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-ink mb-2">
          <span>Question {currentIndex + 1} of {totalQuestions}</span>
          <span className="text-ink-muted">{progressPercent}% completed</span>
        </div>
        <div className="w-full h-1.5 bg-surface-border rounded-full overflow-hidden">
          <div
            className="h-full bg-amber transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Slide transition container for each question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id ?? currentIndex}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-surface rounded-2xl border border-surface-border p-5 sm:p-7 shadow-soft mb-6"
        >
          {/* Topic Pill */}
          <div className="mb-3">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-ink bg-cream px-2.5 py-0.5 rounded-md border border-amber/30">
              {question.topic}
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-ink leading-snug mb-6">
            {question.question}
          </h3>

          {/* 4 Large Option Buttons (Radio semantics) */}
          <div
            role="radiogroup"
            aria-label="Question options"
            className="space-y-3"
          >
            {question.options.map((optionText, idx) => {
              const isSelected = selectedAnswerIndex === idx;
              const optionNumber = idx + 1;

              return (
                <button
                  key={idx}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectOption(idx)}
                  className={`w-full p-4 rounded-xl text-left flex items-start gap-3.5 transition-all focus:outline-none focus:ring-2 focus:ring-amber ${
                    isSelected
                      ? 'bg-cream border-2 border-ink text-ink shadow-soft'
                      : 'bg-surface-warm hover:bg-cream/40 border border-surface-border hover:border-amber/60 text-ink'
                  }`}
                >
                  {/* Keyboard key badge / Radio indicator */}
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-ink text-surface-warm'
                        : 'bg-surface border border-surface-border text-ink-muted'
                    }`}
                  >
                    {optionNumber}
                  </span>

                  <span className="text-xs sm:text-sm font-semibold leading-relaxed flex-1 mt-0.5">
                    {optionText}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-[11px] text-ink-muted text-right hidden sm:block">
            Keyboard shortcut: Press <kbd className="px-1.5 py-0.5 bg-surface-warm border border-surface-border rounded font-mono text-[10px] text-ink">1</kbd>–<kbd className="px-1.5 py-0.5 bg-surface-warm border border-surface-border rounded font-mono text-[10px] text-ink">4</kbd> to choose &bull; <kbd className="px-1.5 py-0.5 bg-surface-warm border border-surface-border rounded font-mono text-[10px] text-ink">Enter</kbd> to proceed
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Unanswered count notice on final question */}
      {isLast && unansweredCount > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-orange/15 border border-orange/40 flex items-center gap-2.5 text-xs text-ink">
          <AlertTriangle className="w-4 h-4 text-orange flex-shrink-0" />
          <span>
            <strong>{unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}</strong>; unanswered questions will count as incorrect.
          </span>
        </div>
      )}

      {/* Navigation Controls Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Back Button */}
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst || isSubmitting}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-surface-border bg-surface hover:bg-cream font-semibold text-xs text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-amber disabled:opacity-40 disabled:cursor-not-allowed shadow-soft-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {/* Right action: Next or Submit */}
        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber hover:bg-amber/90 active:scale-[0.99] font-bold text-xs sm:text-sm text-ink shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Grading...' : 'Submit quiz'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber hover:bg-amber/90 active:scale-[0.99] font-bold text-xs sm:text-sm text-ink shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
