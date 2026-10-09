import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import ScoreRing from './ScoreRing';

/**
 * QuizResults Component:
 * - Large ScoreRing with "{score} of {total} correct"
 * - Level badge (Easy, Medium, Hard)
 * - Summary sentence from API
 * - "Strong topics" (amber chips) and "Needs work" (coral-tinted chips; hidden if empty)
 * - Expandable review list: check/cross icon, your answer vs correct answer, explanation
 * - "Retake (new questions)", "Try {next level}" (hidden if hard), "Back to roadmap"
 * - If percent >= 80 show congratulation line
 * - If weak_topics exist, "Review these topics" button closes quiz and scrolls/highlights those topics
 */
export default function QuizResults({
  result,
  rawQuestions,
  onRetake,
  onTryNextLevel,
  onClose,
  onReviewTopics,
}) {
  const {
    score = 0,
    total = 0,
    percent = 0,
    level = 'easy',
    skill,
    strong_topics = [],
    weak_topics = [],
    summary = '',
    review = [],
  } = result;

  const [isReviewExpanded, setIsReviewExpanded] = useState(true);

  const isPassing = percent >= 80;
  const nextLevel = level === 'easy' ? 'medium' : level === 'medium' ? 'hard' : null;

  return (
    <div className="max-w-2xl mx-auto py-2">
      {/* Top Results Card */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 sm:p-8 shadow-soft text-center mb-6">
        {/* Level Badge */}
        <div className="mb-4">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-ink bg-cream px-3 py-1 rounded-full border border-amber/30">
            {level.toUpperCase()} ASSESSMENT
          </span>
        </div>

        {/* Score Ring */}
        <div className="my-4">
          <ScoreRing percent={percent} score={score} total={total} size={110} />
        </div>

        {/* Congratulation Line if >= 80% */}
        {isPassing && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber/20 border border-amber/40 text-xs font-bold text-ink mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber" />
            <span>Outstanding! You have mastered this difficulty milestone.</span>
          </div>
        )}

        {/* Summary Sentence from API */}
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed max-w-lg mx-auto mb-6">
          {summary}
        </p>

        {/* Topic Breakdown Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-6 border-t border-surface-border">
          {/* Strong Topics */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2">
              Strong Topics ({strong_topics.length})
            </div>
            {strong_topics.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {strong_topics.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cream text-ink text-xs font-semibold border border-amber/40"
                  >
                    <CheckCircle2 className="w-3 h-3 text-ink" />
                    <span>{t}</span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-ink-muted">No full-score topics yet.</span>
            )}
          </div>

          {/* Weak Topics */}
          {weak_topics.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2">
                Needs Work ({weak_topics.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {weak_topics.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-coral/15 text-ink text-xs font-semibold border border-coral/30"
                  >
                    <XCircle className="w-3 h-3 text-coral" />
                    <span>{t}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {/* Retake Button */}
          <button
            type="button"
            onClick={onRetake}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-surface-border bg-surface hover:bg-cream font-bold text-xs sm:text-sm text-ink transition-colors shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake (new questions)</span>
          </button>

          {/* Try Next Level if available */}
          {nextLevel && (
            <button
              type="button"
              onClick={onTryNextLevel}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber hover:bg-amber/90 font-bold text-xs sm:text-sm text-ink transition-all shadow-soft focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2"
            >
              <span>Try {nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Review weak topics in roadmap accordion */}
          {weak_topics.length > 0 && onReviewTopics && (
            <button
              type="button"
              onClick={() => onReviewTopics(weak_topics)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cream hover:bg-amber/40 border border-surface-border font-bold text-xs sm:text-sm text-ink transition-colors shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-amber"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Review these topics</span>
            </button>
          )}
        </div>

        {/* Back to roadmap */}
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-bold text-ink underline underline-offset-4 hover:text-ink-muted ml-auto"
        >
          Back to roadmap
        </button>
      </div>

      {/* Expandable Detailed Question Review */}
      <div className="bg-surface rounded-2xl border border-surface-border shadow-soft overflow-hidden">
        <button
          type="button"
          onClick={() => setIsReviewExpanded(!isReviewExpanded)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-cream/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber border-b border-surface-border"
          aria-expanded={isReviewExpanded}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-ink">
              Detailed Question Review ({review.length} Questions)
            </h3>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${
              isReviewExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isReviewExpanded && (
          <div className="divide-y divide-surface-border p-4 sm:p-5 space-y-4">
            {review.map((item, idx) => {
              const qObj = rawQuestions?.find((q) => q.id === item.id) || rawQuestions?.[idx];
              const isCorrect = item.correct;
              const hasAnswered = item.your_index !== null && item.your_index !== undefined;

              const yourAnswerText = hasAnswered && qObj?.options?.[item.your_index]
                ? qObj.options[item.your_index]
                : 'Not answered';

              const correctAnswerText = qObj?.options?.[item.correct_index] || '';

              return (
                <div key={item.id ?? idx} className="pt-4 first:pt-0">
                  {/* Status header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <div className="w-5 h-5 rounded-full bg-cream border border-amber flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-ink" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-coral/20 border border-coral flex items-center justify-center flex-shrink-0">
                          <XCircle className="w-3.5 h-3.5 text-coral" />
                        </div>
                      )}
                      <span className="text-xs font-bold text-ink">Question {idx + 1}</span>
                      <span className="text-[10px] uppercase font-bold text-ink-muted bg-surface-warm px-2 py-0.5 rounded border border-surface-border">
                        {item.topic}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isCorrect
                          ? 'bg-amber/20 text-ink'
                          : 'bg-coral/20 text-ink'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  {/* Question text */}
                  <p className="text-xs sm:text-sm font-semibold text-ink mb-3 leading-snug">
                    {qObj?.question}
                  </p>

                  {/* Answers Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
                    {/* Your answer */}
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isCorrect
                          ? 'bg-cream/40 border-amber/40 text-ink'
                          : 'bg-coral/10 border-coral/30 text-ink'
                      }`}
                    >
                      <span className="block font-bold text-[10px] uppercase tracking-wider text-ink-muted mb-0.5">
                        Your answer:
                      </span>
                      <span className="font-semibold">{yourAnswerText}</span>
                    </div>

                    {/* Correct answer */}
                    <div className="p-2.5 rounded-xl border bg-surface-warm border-surface-border text-ink">
                      <span className="block font-bold text-[10px] uppercase tracking-wider text-ink-muted mb-0.5">
                        Correct answer:
                      </span>
                      <span className="font-semibold text-ink">{correctAnswerText}</span>
                    </div>
                  </div>

                  {/* Explanation */}
                  {item.explanation && (
                    <div className="p-3 rounded-xl bg-surface-warm border border-surface-border text-xs text-ink-muted leading-relaxed">
                      <span className="font-bold text-ink">Explanation: </span>
                      {item.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
