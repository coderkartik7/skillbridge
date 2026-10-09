import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Briefcase,
  ChevronRight,
  Award,
} from 'lucide-react';
import { getUserRoadmap, updateUserTopicProgress } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StepAccordion from '../components/StepAccordion';
import ProgressRing from '../components/ProgressRing';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';
import QuizModal from '../components/quiz/QuizModal';

/**
 * /dashboard/:id Roadmap Tracker:
 * - Header: role title, progress ring with percent, "X of Y topics done", "Back to dashboard",
 *   "You were X% ready when you started" from roadmap.readiness.
 * - Left column = vertical step list (accordion, one card per step in order, showing step number,
 *   skill, trending flame badge, mini progress bar). Expanding shows topics.
 * - Right column (sticky summary desktop / stack mobile) = overall progress, next suggested topic
 *   (first undone topic), and "Continue" button that scrolls and highlights it.
 * - Ticking updates UI optimistically, calls PUT /me/roadmaps/:id/topic, sets percent from response.
 * - When whole step completes: toast "Skill complete: {skill}".
 * - At 100%: congratulation banner with "Find jobs for this role".
 */
export default function RoadmapTracker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [roadmapDetails, setRoadmapDetails] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [percent, setPercent] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Active quiz skill modal state
  const [activeQuizSkill, setActiveQuizSkill] = useState(null);

  // Track previous step completion states to trigger celebration toast
  const stepCompletionCache = useRef({});

  const fetchDetails = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await getUserRoadmap(id);
      setRoadmapDetails(data);
      setProgressList(data.progress || []);
      setPercent(data.percent || 0);

      // Auto-expand the first step that contains an undone topic
      const steps = data.roadmap?.steps || [];
      const initialExpanded = {};
      let foundActive = false;

      for (const s of steps) {
        const stepHasUndone = s.topics.some((t) => {
          const p = (data.progress || []).find(
            (item) => item.skill === s.skill && item.topic === t.name
          );
          return !p?.done;
        });

        // Initialize completion cache
        const allDone = s.topics.every((t) => {
          const p = (data.progress || []).find(
            (item) => item.skill === s.skill && item.topic === t.name
          );
          return !!p?.done;
        });
        stepCompletionCache.current[s.skill] = allDone;

        if (stepHasUndone && !foundActive) {
          initialExpanded[s.order] = true;
          foundActive = true;
        }
      }

      // If all completed or none found, expand first step
      if (!foundActive && steps.length > 0) {
        initialExpanded[steps[0].order] = true;
      }
      setExpandedSteps(initialExpanded);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load roadmap details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const roadmap = roadmapDetails?.roadmap;
  const steps = roadmap?.steps || [];

  // Compute total topics count and completed topics count
  const { totalTopicsCount, doneTopicsCount, nextSuggestedTopic } = useMemo(() => {
    let total = 0;
    let done = 0;
    let nextUndone = null;

    for (const step of steps) {
      for (const topic of step.topics) {
        total++;
        const p = progressList.find(
          (item) => item.skill === step.skill && item.topic === topic.name
        );
        if (p?.done) {
          done++;
        } else if (!nextUndone) {
          nextUndone = {
            stepOrder: step.order,
            skill: step.skill,
            topic: topic.name,
          };
        }
      }
    }

    return {
      totalTopicsCount: total,
      doneTopicsCount: done,
      nextSuggestedTopic: nextUndone,
    };
  }, [steps, progressList]);

  // Handle toggling topic done state optimistically
  const handleToggleDone = async ({ skill, topic, done }) => {
    // 1. Optimistic update
    const previousProgressList = [...progressList];
    const existingIndex = progressList.findIndex(
      (p) => p.skill === skill && p.topic === topic
    );

    let nextProgressList;
    if (existingIndex >= 0) {
      nextProgressList = progressList.map((p, idx) =>
        idx === existingIndex ? { ...p, done } : p
      );
    } else {
      nextProgressList = [...progressList, { skill, topic, done, note: '' }];
    }

    setProgressList(nextProgressList);

    try {
      const res = await updateUserTopicProgress(id, { skill, topic, done });
      setPercent(res.percent);

      // Check if this step just became fully completed
      const targetStep = steps.find((s) => s.skill === skill);
      if (targetStep) {
        const stepAllDone = targetStep.topics.every((t) => {
          const item = nextProgressList.find(
            (p) => p.skill === skill && p.topic === t.name
          );
          return !!item?.done;
        });

        if (stepAllDone && !stepCompletionCache.current[skill]) {
          stepCompletionCache.current[skill] = true;
          showToast({
            type: 'success',
            message: `Skill complete: ${skill}! Great work!`,
          });
        } else if (!stepAllDone) {
          stepCompletionCache.current[skill] = false;
        }
      }
    } catch (err) {
      // Revert on failure
      setProgressList(previousProgressList);
      showToast({
        type: 'error',
        message: err.message || 'Failed to update topic status. Reverting change.',
      });
    }
  };

  // Handle saving personal note
  const handleSaveNote = async ({ skill, topic, note }) => {
    const existingIndex = progressList.findIndex(
      (p) => p.skill === skill && p.topic === topic
    );
    let nextList;
    if (existingIndex >= 0) {
      nextList = progressList.map((p, idx) =>
        idx === existingIndex ? { ...p, note } : p
      );
    } else {
      nextList = [...progressList, { skill, topic, done: false, note }];
    }
    setProgressList(nextList);

    await updateUserTopicProgress(id, { skill, topic, note });
  };

  const toggleStepAccordion = (order) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [order]: !prev[order],
    }));
  };

  // Scroll and highlight next suggested topic
  const handleContinueNext = () => {
    if (!nextSuggestedTopic) return;
    setExpandedSteps((prev) => ({
      ...prev,
      [nextSuggestedTopic.stepOrder]: true,
    }));

    setTimeout(() => {
      const el = document.getElementById(
        `topic-${nextSuggestedTopic.topic.replace(/\s+/g, '-').toLowerCase()}`
      );
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-amber');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-amber');
        }, 1500);
      }
    }, 150);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-ink">Loading your roadmap tracker...</p>
      </div>
    );
  }

  if (errorMessage || !roadmapDetails) {
    return (
      <div className="max-w-xl mx-auto my-12 w-full">
        <ErrorAlert
          message={errorMessage || 'Roadmap not found.'}
          onRetry={fetchDetails}
        />
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-xs font-semibold text-ink underline"
          >
            Return to dashboard
          </button>
        </div>
      </div>
    );
  }

  const isAllComplete = percent === 100 || (totalTopicsCount > 0 && doneTopicsCount === totalTopicsCount);

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Top Header Card */}
      <div className="bg-surface rounded-2xl border border-surface-border p-5 sm:p-6 mb-8 shadow-soft">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink mb-3 focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to dashboard</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-cream px-2 py-0.5 rounded-md">
                Roadmap #{roadmapDetails.id}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-surface-warm border border-surface-border px-2 py-0.5 rounded-md">
                Role Code: {roadmap.role.code}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{roadmap.role.title}</h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              You were <strong className="text-ink">{roadmap.readiness}% ready</strong> when you started this bridge.
            </p>
          </div>

          {/* Header Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-surface-warm p-3 px-4 rounded-xl border border-surface-border shadow-soft-sm">
              <ProgressRing percent={percent} size={48} strokeWidth={4} />
              <div>
                <div className="text-xs font-bold text-ink">
                  {doneTopicsCount} of {totalTopicsCount} topics done
                </div>
                <div className="text-[11px] text-ink-muted">{percent}% complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 100% Congratulations Banner */}
      {isAllComplete && (
        <div className="mb-8 p-6 rounded-2xl bg-cream border border-amber flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-ink" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Congratulations! Roadmap 100% Completed!</h2>
              <p className="text-xs sm:text-sm text-ink-muted">
                You have closed every skill gap identified for {roadmap.role.title}. You are ready for live openings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-surface-warm hover:bg-ink/90 font-bold text-xs sm:text-sm shadow-soft transition-all focus:ring-2 focus:ring-amber flex-shrink-0"
          >
            <Briefcase className="w-4 h-4" />
            <span>Find jobs for this role</span>
          </button>
        </div>
      )}

      {/* Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vertical Step Accordion (order 1..N) */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-base font-bold text-ink">Roadmap Milestones ({steps.length} Steps)</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const all = {};
                  steps.forEach((s) => (all[s.order] = true));
                  setExpandedSteps(all);
                }}
                className="text-xs font-semibold text-ink-muted hover:text-ink underline"
              >
                Expand all
              </button>
              <span className="text-ink-muted text-xs">&bull;</span>
              <button
                type="button"
                onClick={() => setExpandedSteps({})}
                className="text-xs font-semibold text-ink-muted hover:text-ink underline"
              >
                Collapse all
              </button>
            </div>
          </div>

          <div>
            {steps.map((step) => (
              <StepAccordion
                key={step.order}
                step={step}
                isExpanded={!!expandedSteps[step.order]}
                onToggle={() => toggleStepAccordion(step.order)}
                stepProgressList={progressList}
                onToggleDone={handleToggleDone}
                onSaveNote={handleSaveNote}
                onOpenQuiz={(s) => setActiveQuizSkill(s.skill)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Sticky Summary Panel */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-soft">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-muted mb-4">
              Journey Overview
            </h2>

            {/* Circular Progress & Percentage */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-surface-border">
              <ProgressRing percent={percent} size={64} strokeWidth={5} labelClassName="text-sm font-extrabold text-ink" />
              <div>
                <div className="text-lg font-bold text-ink">{percent}% completed</div>
                <div className="text-xs text-ink-muted">
                  {doneTopicsCount} of {totalTopicsCount} topics checked
                </div>
              </div>
            </div>

            {/* Next Suggested Topic */}
            {nextSuggestedTopic ? (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber" />
                  <span>Next suggested topic</span>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-warm border border-surface-border mb-4">
                  <div className="text-[10px] font-bold uppercase text-ink-muted mb-1">
                    Step {nextSuggestedTopic.stepOrder} &bull; {nextSuggestedTopic.skill}
                  </div>
                  <div className="text-xs font-bold text-ink leading-snug">
                    {nextSuggestedTopic.topic}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContinueNext}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber hover:bg-amber/90 active:scale-[0.99] font-bold text-xs sm:text-sm text-ink shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-amber"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-amber mx-auto mb-2" />
                <div className="text-sm font-bold text-ink">All topics complete!</div>
                <p className="text-xs text-ink-muted mt-1">
                  You've completed all topics in this roadmap.
                </p>
              </div>
            )}
          </div>

          {/* Quick link to Jobs */}
          <div className="bg-surface-warm rounded-2xl border border-surface-border p-5 text-xs text-ink-muted">
            <div className="flex items-center gap-2 text-ink font-bold mb-1">
              <Briefcase className="w-4 h-4 text-ink" />
              <span>Matching Jobs</span>
            </div>
            <p className="mb-3 leading-relaxed">
              Every topic you complete updates your active skill profile when matching against real job openings.
            </p>
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="font-bold text-ink underline underline-offset-2 hover:text-amber-900"
            >
              Browse openings for this role &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {activeQuizSkill && (
        <QuizModal
          isOpen={!!activeQuizSkill}
          skill={activeQuizSkill}
          roadmapId={id}
          onClose={() => setActiveQuizSkill(null)}
          onReviewTopics={(weakTopics) => {
            setActiveQuizSkill(null);
            // Find step corresponding to this skill and expand it
            const targetStep = steps.find((s) => s.skill === activeQuizSkill);
            if (targetStep) {
              setExpandedSteps((prev) => ({
                ...prev,
                [targetStep.order]: true,
              }));
            }

            // Scroll to and highlight the first weak topic
            if (weakTopics && weakTopics.length > 0) {
              const firstWeakTopic = weakTopics[0];
              setTimeout(() => {
                const el = document.getElementById(
                  `topic-${firstWeakTopic.replace(/\s+/g, '-').toLowerCase()}`
                );
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.classList.add('ring-2', 'ring-coral', 'bg-coral/10');
                  setTimeout(() => {
                    el.classList.remove('ring-2', 'ring-coral', 'bg-coral/10');
                  }, 2500);
                }
              }, 200);
            }
          }}
        />
      )}
    </div>
  );
}
