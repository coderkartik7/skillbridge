import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ExternalLink, FileEdit, HelpCircle } from 'lucide-react';

/**
 * TopicRow Component:
 * - Accessible checkbox with hit area and amber animation
 * - Topic name (strikethrough and muted when done)
 * - Compact "Free" and "Paid" buttons (new tab, rel="noopener noreferrer")
 * - Fallback=true shows cream "Suggested search" pill with tooltip
 * - "Note" button with inline textarea (max 2000 chars), debounce 800ms save, "Saved" indicator
 */
export default function TopicRow({
  skill,
  topic,
  progress,
  onToggleDone,
  onSaveNote,
}) {
  const isDone = !!progress?.done;
  const initialNote = progress?.note || '';

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(initialNote);
  const [saveStatus, setSaveStatus] = useState(''); // '' | 'saving' | 'saved'

  // Sync when progress changes externally
  useEffect(() => {
    setNoteText(progress?.note || '');
  }, [progress?.note]);

  const hasNote = Boolean((progress?.note || '').trim());
  const debounceTimerRef = useRef(null);

  const handleTextChange = (e) => {
    const val = e.target.value.slice(0, 2000);
    setNoteText(val);
    setSaveStatus('saving');

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        await onSaveNote({ skill, topic: topic.name, note: val });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch {
        setSaveStatus('');
      }
    }, 800);
  };

  const handleBlur = async () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (noteText !== (progress?.note || '')) {
      setSaveStatus('saving');
      try {
        await onSaveNote({ skill, topic: topic.name, note: noteText });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch {
        setSaveStatus('');
      }
    }
  };

  return (
    <div
      id={`topic-${topic.name.replace(/\s+/g, '-').toLowerCase()}`}
      className={`border-b border-surface-border last:border-b-0 py-3.5 px-3 sm:px-4 transition-colors rounded-xl ${
        isDone ? 'bg-cream/10' : 'hover:bg-cream/20'
      }`}
    >
      <div className="flex items-start sm:items-center justify-between gap-3">
        {/* Left: Checkbox + Topic Name */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Accessible Checkbox */}
          <button
            type="button"
            role="checkbox"
            aria-checked={isDone}
            aria-label={`Mark topic "${topic.name}" as ${isDone ? 'incomplete' : 'complete'}`}
            onClick={() => onToggleDone({ skill, topic: topic.name, done: !isDone })}
            className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 transition-all focus:outline-none focus:ring-2 focus:ring-amber ${
              isDone
                ? 'bg-amber border-amber text-ink shadow-soft-sm'
                : 'bg-surface border-surface-border hover:border-amber text-transparent'
            }`}
          >
            {isDone && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </motion.div>
            )}
          </button>

          {/* Topic Title */}
          <div className="min-w-0 flex-1">
            <span
              className={`text-xs sm:text-sm font-medium leading-relaxed block ${
                isDone ? 'line-through text-ink-muted' : 'text-ink font-semibold'
              }`}
            >
              {topic.name}
            </span>

            {/* Fallback resource indicator */}
            {topic.fallback && (
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-cream text-[10px] text-ink font-medium border border-amber/30 group relative cursor-help">
                <span>Suggested search</span>
                <HelpCircle className="w-3 h-3 text-ink-muted" />
                <span className="sr-only">
                  Auto-generated search link; curated resources are coming.
                </span>
                <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 bg-ink text-surface-warm text-[10px] rounded-lg shadow-soft-lg z-20 pointer-events-none">
                  Auto-generated search link; curated resources are coming.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions (Free, Paid, Note toggle) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Free Link */}
          {topic.free?.url && (
            <a
              href={topic.free.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-ink bg-surface hover:bg-cream border border-surface-border transition-colors shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-amber"
              title={topic.free.title || 'Free resource'}
            >
              <span>Free</span>
              <ExternalLink className="w-2.5 h-2.5 text-ink-muted" />
            </a>
          )}

          {/* Paid Link */}
          {topic.paid?.url && (
            <a
              href={topic.paid.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-ink bg-surface hover:bg-cream border border-surface-border transition-colors shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-amber"
              title={topic.paid.title || 'Paid course'}
            >
              <span>Paid</span>
              <ExternalLink className="w-2.5 h-2.5 text-ink-muted" />
            </a>
          )}

          {/* Note Toggle Button */}
          <button
            type="button"
            onClick={() => setIsNoteOpen(!isNoteOpen)}
            className={`relative p-1.5 rounded-lg text-ink hover:bg-cream border border-surface-border transition-colors focus:outline-none focus:ring-2 focus:ring-amber ${
              isNoteOpen ? 'bg-cream' : 'bg-surface'
            }`}
            aria-label={isNoteOpen ? 'Hide personal notes' : 'Open personal notes'}
            title="Personal Notes"
          >
            <FileEdit className="w-3.5 h-3.5 text-ink" />
            {hasNote && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber ring-2 ring-surface"
                title="Has note"
              />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Note Textarea */}
      <AnimatePresence>
        {isNoteOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t border-surface-border overflow-hidden"
          >
            <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1 px-1">
              <span>Personal notes & takeaways</span>
              <div className="flex items-center gap-2">
                {saveStatus === 'saving' && <span className="text-amber">Saving...</span>}
                {saveStatus === 'saved' && <span className="text-ink font-semibold">✓ Saved</span>}
                <span>{noteText.length}/2000</span>
              </div>
            </div>
            <textarea
              rows={3}
              value={noteText}
              onChange={handleTextChange}
              onBlur={handleBlur}
              placeholder="Jot down notes, formulas, key links or questions..."
              className="w-full p-2.5 text-xs rounded-xl border border-surface-border bg-surface-warm text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-amber focus:border-amber focus:outline-none resize-y transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
