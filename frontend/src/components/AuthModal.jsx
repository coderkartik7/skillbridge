import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * Accessible Auth Modal with Log In and Sign Up tabs,
 * focus trapping, keyboard Esc to dismiss, inline errors, and loading state.
 */
export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalDefaultTab, login, signup } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const modalRef = useRef(null);
  const emailInputRef = useRef(null);

  // Sync tab when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalDefaultTab || 'login');
      setErrorMessage('');
      // Autofocus first input after animation
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [isAuthModalOpen, authModalDefaultTab]);

  // Handle ESC key and focus trapping
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }

      // Trap focus
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6 || password.length > 72) {
      setErrorMessage('Password must be between 6 and 72 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (tab === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await signup({ email: email.trim(), password });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Modal Dialog Card */}
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-soft-lg z-10 my-8"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink hover:bg-cream rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="w-9 h-9 rounded-xl bg-cream border border-amber/40 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-ink" />
            </div>
            <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-extrabold text-ink">
              {tab === 'login' ? 'Welcome back' : 'Start your journey'}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              {tab === 'login'
                ? 'Sign in to access your saved roadmaps, job openings, and market news.'
                : 'Create an account to save your roadmap, track learning progress, and apply for jobs.'}
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex p-1 bg-surface-warm border border-surface-border rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-amber text-ink shadow-soft-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                tab === 'signup'
                  ? 'bg-amber text-ink shadow-soft-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-coral/15 border border-coral/30 flex items-start gap-2.5 text-xs text-ink">
              <AlertCircle className="w-4 h-4 text-coral flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                ref={emailInputRef}
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-border bg-surface-warm text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-amber focus:border-amber focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6–72 characters"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-surface-border bg-surface-warm text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-amber focus:border-amber focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-amber hover:bg-amber/90 active:scale-[0.99] font-bold text-sm text-ink shadow-soft transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-amber focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  <span>{tab === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <span>{tab === 'login' ? 'Log in' : 'Create account'}</span>
              )}
            </button>
          </form>

          {/* Footer switch prompt */}
          <div className="mt-5 text-center text-xs text-ink-muted">
            {tab === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setErrorMessage('');
                  }}
                  className="font-bold text-ink underline underline-offset-2 decoration-amber hover:text-amber-800 focus:outline-none"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setErrorMessage('');
                  }}
                  className="font-bold text-ink underline underline-offset-2 decoration-amber hover:text-amber-800 focus:outline-none"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
