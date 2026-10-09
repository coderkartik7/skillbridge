import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

/**
 * Toast notification component.
 * Displays temporary feedback messages (success/error) with auto-dismiss.
 */
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-soft-lg ${
            isError
              ? 'bg-surface border-coral/40 text-ink'
              : 'bg-surface border-amber/40 text-ink'
          }`}
          role="status"
          aria-live="polite"
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isError ? 'bg-coral/20 text-coral' : 'bg-cream text-ink'
            }`}
          >
            {isError ? (
              <AlertCircle className="w-4 h-4 text-[#FF7E7E]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-ink" />
            )}
          </div>

          <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed pr-1">
            {toast.message}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-ink-muted hover:text-ink rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
