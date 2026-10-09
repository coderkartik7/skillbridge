import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Flame, CheckCircle, Sparkles, PlusCircle, HelpCircle } from 'lucide-react';
import TopicRow from './TopicRow';

/**
 * StepAccordion Component:
 * - One card per step in order
 * - Step number, skill title, trending flame badge, mini progress bar (3/9)
 * - Accordion expand/collapse
 * - List of TopicRows
 * - "Add your own resource (coming soon)" disabled button
 * - Celebratory moment when whole step becomes complete
 */
export default function StepAccordion({
  step,
  isExpanded,
  onToggle,
  stepProgressList,
  onToggleDone,
  onSaveNote,
  onOpenQuiz,
}) {
  const totalTopics = step.topics.length;
  const completedTopicsCount = step.topics.filter((topic) => {
    const p = stepProgressList.find(
      (item) => item.skill === step.skill && item.topic === topic.name
    );
    return !!p?.done;
  }).length;

  // Enabled when at least one topic of that step is ticked
  const hasTickedTopic = completedTopicsCount > 0;
  const isStepComplete = totalTopics > 0 && completedTopicsCount === totalTopics;
  const percent = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

  return (
    <div
      id={`step-${step.order}`}
      className={`rounded-2xl border transition-all mb-4 overflow-hidden bg-surface ${
        isStepComplete
          ? 'border-amber/50 bg-cream/5 shadow-soft-sm'
          : 'border-surface-border shadow-soft'
      }`}
    >
      {/* Header Button */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-cream/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber"
        aria-expanded={isExpanded}
        aria-controls={`step-content-${step.order}`}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Step Number Circle */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
              isStepComplete
                ? 'bg-amber text-ink'
                : 'bg-cream border border-surface-border text-ink'
            }`}
          >
            {isStepComplete ? <CheckCircle className="w-4 h-4 stroke-[2.5]" /> : step.order}
          </div>

          {/* Skill Title & Badges */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Step {step.order}
              </span>
              {step.is_trending && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-coral/15 text-ink text-[10px] font-bold border border-coral/30">
                  <Flame className="w-3 h-3 text-[#FF7E7E]" />
                  <span>Trending</span>
                </span>
              )}
              {isStepComplete && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber/30 text-ink text-[10px] font-bold border border-amber/40">
                  <Sparkles className="w-3 h-3 text-ink" />
                  <span>Completed</span>
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-ink truncate">{step.skill}</h3>
          </div>
        </div>

        {/* Right side: Quiz Button, Mini progress indicator, and expand arrow */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
          {/* "Take quiz" action button with tooltip */}
          <div className="relative group">
            <button
              type="button"
              disabled={!hasTickedTopic}
              onClick={(e) => {
                e.stopPropagation();
                if (hasTickedTopic && onOpenQuiz) {
                  onOpenQuiz(step);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-amber ${
                hasTickedTopic
                  ? 'bg-cream hover:bg-amber/60 text-ink border border-surface-border hover:border-amber shadow-soft-sm cursor-pointer'
                  : 'bg-surface-warm text-ink-muted/50 border border-surface-border/50 cursor-not-allowed opacity-60'
              }`}
              aria-label={`Take quiz for ${step.skill}`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Take quiz</span>
            </button>

            {/* Tooltip when disabled */}
            {!hasTickedTopic && (
              <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block w-36 p-1.5 bg-ink text-surface-warm text-[10px] text-center rounded-lg shadow-soft-lg z-20 pointer-events-none">
                Tick a topic first
              </div>
            )}
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1.5">
            <span className="text-xs font-semibold text-ink">
              {completedTopicsCount} / {totalTopics}
            </span>
            <div className="w-20 h-1.5 bg-surface-border rounded-full overflow-hidden">
              <div
                className="h-full bg-amber transition-all duration-500 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-ink-muted transition-transform duration-200 ${
              isExpanded ? 'rotate-180 bg-cream' : 'bg-surface-warm'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Accordion Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`step-content-${step.order}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="border-t border-surface-border bg-surface-warm/50"
          >
            {/* Mobile Progress Bar */}
            <div className="sm:hidden px-4 pt-3 pb-1 flex items-center justify-between text-xs text-ink-muted">
              <span>Progress</span>
              <span>
                {completedTopicsCount}/{totalTopics} ({percent}%)
              </span>
            </div>

            <div className="p-2 sm:p-3 divide-y divide-surface-border">
              {step.topics.map((topic) => {
                const progress = stepProgressList.find(
                  (p) => p.skill === step.skill && p.topic === topic.name
                );
                return (
                  <TopicRow
                    key={topic.name}
                    skill={step.skill}
                    topic={topic}
                    progress={progress}
                    onToggleDone={onToggleDone}
                    onSaveNote={onSaveNote}
                  />
                );
              })}
            </div>

            {/* Disabled "Add your own resource (coming soon)" text button */}
            <div className="p-4 pt-2 border-t border-surface-border/60 flex justify-center">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted/60 cursor-not-allowed py-1 px-3 rounded-lg"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add your own resource (coming soon)</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
