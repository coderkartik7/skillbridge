import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { startQuiz, submitQuiz } from '../../api/client';
import QuizSetup from './QuizSetup';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import Spinner from '../Spinner';
import ErrorAlert from '../ErrorAlert';

/**
 * QuizModal Component:
 * - Full-screen modal for skill assessment
 * - Flow: Step 1 (Setup) -> Step 2 (Loading questions) -> Step 3 (Questions) -> Step 4 (Results)
 * - Esc key to close with confirmation if quiz is in progress
 * - Focus trap & keyboard accessibility
 */
export default function QuizModal({
  isOpen,
  onClose,
  roadmapId,
  skill,
  onReviewTopics,
}) {
  // Step state: 'setup' | 'loading' | 'questions' | 'results'
  const [step, setStep] = useState('setup');
  const [level, setLevel] = useState('easy');

  // Quiz active data
  const [quizData, setQuizData] = useState(null); // { quiz_id, skill, level, questions }
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answersMap, setAnswersMap] = useState({}); // { "0": 2, "1": 0 }

  // Submission & Results
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Errors & Loading
  const [errorMessage, setErrorMessage] = useState('');
  const [isExpiredError, setIsExpiredError] = useState(false);

  // Confirm close prompt if quiz is currently underway
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const modalRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('setup');
      setLevel('easy');
      setQuizData(null);
      setCurrentQuestionIdx(0);
      setAnswersMap({});
      setQuizResult(null);
      setErrorMessage('');
      setIsExpiredError(false);
      setShowExitConfirm(false);
    }
  }, [isOpen, skill]);

  // Handle Safe Close
  const requestClose = useCallback(() => {
    if (step === 'questions' && !quizResult) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  }, [step, quizResult, onClose]);

  // Focus trap and ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showExitConfirm) {
          setShowExitConfirm(false);
        } else {
          requestClose();
        }
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showExitConfirm, requestClose]);

  // Start Quiz Handler (Transition: setup -> loading -> questions)
  const handleStartQuiz = async (selectedLevel = level) => {
    setStep('loading');
    setErrorMessage('');
    setIsExpiredError(false);
    try {
      const data = await startQuiz({
        roadmap_id: Number(roadmapId),
        skill,
        level: selectedLevel,
      });
      setQuizData(data);
      setCurrentQuestionIdx(0);
      setAnswersMap({});
      setStep('questions');
    } catch (err) {
      setErrorMessage(err.message || 'Could not generate the quiz. Please try again.');
      setStep('setup');
    }
  };

  // Option selection
  const handleSelectOption = (optionIndex) => {
    setAnswersMap((prev) => ({
      ...prev,
      [String(currentQuestionIdx)]: optionIndex,
    }));
  };

  // Question Navigation
  const handlePreviousQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (quizData?.questions && currentQuestionIdx < quizData.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  // Submit Quiz Handler
  const handleSubmitQuiz = async () => {
    if (!quizData?.quiz_id) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setIsExpiredError(false);
    try {
      const result = await submitQuiz(quizData.quiz_id, answersMap);
      setQuizResult(result);
      setStep('results');
    } catch (err) {
      if (err.status === 404 || err.message?.includes('expired')) {
        setIsExpiredError(true);
        setErrorMessage('This quiz expired. Start a new one.');
      } else {
        setErrorMessage(err.message || 'Failed to submit quiz. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalQuestions = quizData?.questions?.length || 0;
  const answeredCount = Object.keys(answersMap).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={requestClose}
          className="fixed inset-0 bg-ink/50 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Modal Dialog Card */}
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Quiz for ${skill}`}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-surface-warm border border-surface-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-soft-lg z-10 my-auto max-h-[92vh] overflow-y-auto"
        >
          {/* Top Bar with Skill Name and Close Button */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted bg-cream px-2 py-0.5 rounded-md">
                SkillBridge Quiz
              </span>
              <span className="text-xs font-bold text-ink truncate max-w-[200px] sm:max-w-md">
                {skill}
              </span>
            </div>

            <button
              type="button"
              onClick={requestClose}
              className="p-2 text-ink-muted hover:text-ink hover:bg-cream rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber"
              aria-label="Close quiz modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Exit Confirmation Dialog Overlay */}
          {showExitConfirm && (
            <div className="p-4 mb-6 rounded-2xl bg-cream border border-amber/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-soft">
              <div className="flex items-center gap-2.5 text-xs text-ink">
                <AlertCircle className="w-4 h-4 text-orange flex-shrink-0" />
                <span>
                  <strong>Quiz in progress.</strong> Leaving now will discard your answers for this session.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-surface-border text-ink"
                >
                  Continue quiz
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-coral/20 text-ink hover:bg-coral/30"
                >
                  Discard & Exit
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Quiz Setup */}
          {step === 'setup' && (
            <>
              {errorMessage && (
                <div className="mb-6">
                  <ErrorAlert message={errorMessage} onRetry={() => handleStartQuiz(level)} />
                </div>
              )}
              <QuizSetup
                skill={skill}
                level={level}
                onSelectLevel={setLevel}
                onStart={() => handleStartQuiz(level)}
                isLoading={false}
              />
            </>
          )}

          {/* Step 2: Loading State ("Writing your questions...") */}
          {step === 'loading' && (
            <div
              aria-live="polite"
              className="py-16 sm:py-24 flex flex-col items-center justify-center text-center gap-4"
            >
              <Spinner size="lg" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-ink mb-1">
                  Writing your questions...
                </h3>
                <p className="text-xs text-ink-muted max-w-xs mx-auto">
                  Synthesizing custom questions across key roadmap topics for {skill} ({level}).
                </p>
              </div>
              <div className="w-48 h-2 bg-surface-border rounded-full overflow-hidden mt-2">
                <div className="h-full bg-amber rounded-full animate-pulse w-2/3" />
              </div>
            </div>
          )}

          {/* Step 3: Interactive Questions */}
          {step === 'questions' && quizData && (
            <>
              {isExpiredError ? (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-coral/20 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-coral" />
                  </div>
                  <h3 className="text-base font-bold text-ink mb-1">This quiz expired.</h3>
                  <p className="text-xs text-ink-muted mb-6">
                    Quiz sessions expire after inactivity. Start a fresh quiz anytime.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleStartQuiz(level)}
                    className="px-5 py-2.5 rounded-xl bg-amber font-bold text-xs text-ink shadow-soft"
                  >
                    Start a new one
                  </button>
                </div>
              ) : (
                <>
                  {errorMessage && (
                    <div className="mb-4">
                      <ErrorAlert message={errorMessage} onRetry={handleSubmitQuiz} />
                    </div>
                  )}

                  <QuizQuestion
                    question={quizData.questions[currentQuestionIdx]}
                    currentIndex={currentQuestionIdx}
                    totalQuestions={totalQuestions}
                    selectedAnswerIndex={answersMap[String(currentQuestionIdx)]}
                    onSelectOption={handleSelectOption}
                    onPrevious={handlePreviousQuestion}
                    onNext={handleNextQuestion}
                    onSubmit={handleSubmitQuiz}
                    isSubmitting={isSubmitting}
                    unansweredCount={unansweredCount}
                  />
                </>
              )}
            </>
          )}

          {/* Step 4: Results & Detailed Review */}
          {step === 'results' && quizResult && (
            <div aria-live="polite">
              <QuizResults
                result={quizResult}
                rawQuestions={quizData?.questions}
                onRetake={() => handleStartQuiz(level)}
                onTryNextLevel={() => {
                  const nextLvl = level === 'easy' ? 'medium' : 'hard';
                  setLevel(nextLvl);
                  handleStartQuiz(nextLvl);
                }}
                onClose={onClose}
                onReviewTopics={(topics) => {
                  onClose();
                  if (onReviewTopics) {
                    onReviewTopics(topics);
                  }
                }}
              />
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
