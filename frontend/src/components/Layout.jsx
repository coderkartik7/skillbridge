import React from 'react';
import { motion } from 'framer-motion';
import Header from './Header';

/**
 * Global layout wrapper with sticky header, centered max-w-6xl container,
 * smooth Framer Motion page transition (fade + 8px rise, 250ms), and quiet footer.
 */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-warm text-ink">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>

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
