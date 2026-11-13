import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import AuthModal from './AuthModal';
import Toast from './Toast';
import { useAuth } from '../context/AuthContext';
import { subscribeServerWakeup } from '../api/client';

/**
 * Global layout wrapper with sticky header, centered max-w-6xl container,
 * smooth Framer Motion page transition (fade + 8px rise, 250ms), quiet footer,
 * global AuthModal, global Toast container, and server wakeup banner.
 */
export default function Layout({ children }) {
  const { toastMessage, clearToast } = useAuth();
  const location = useLocation();
  const [isWakingUp, setIsWakingUp] = useState(false);

  useEffect(() => {
    return subscribeServerWakeup(setIsWakingUp);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface-warm text-ink">
      {/* Friendly waking-up banner for free plan cold starts */}
      {isWakingUp && (
        <div
          role="status"
          aria-live="polite"
          className="bg-cream border-b border-amber text-ink px-4 py-2.5 text-xs sm:text-sm font-semibold text-center flex items-center justify-center gap-2 sticky top-0 z-50 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-amber animate-pulse inline-block" />
          <span>Waking up the server, this can take up to a minute on the free plan</span>
        </div>
      )}

      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Global Toast System */}
      <Toast toast={toastMessage} onClose={clearToast} />

      {/* Subtle, calm footer */}
      <footer className="border-t border-surface-border py-8 text-center text-xs text-ink-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>SkillBridge &copy; {new Date().getFullYear()}</span>
            <span>&bull;</span>
            <span>Career-security tool for working tech professionals</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy-first &bull; Client-side validation</span>
            <span>&bull;</span>
            <span className="font-mono">FastAPI Backend Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
