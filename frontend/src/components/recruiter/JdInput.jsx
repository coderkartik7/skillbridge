import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';

const MIN_JD_CHARS = 40;
const MAX_JD_CHARS = 10000;

/**
 * JdInput component:
 * - Large textarea for Job Description
 * - Character counter
 * - Min 40 / max 10,000 validation with inline warnings
 * - Hint: "Put one requirement per line for the best results."
 *
 * @param {{
 *   value: string,
 *   onChange: (val: string) => void,
 *   disabled?: boolean
 * }} props
 */
export default function JdInput({ value = '', onChange, disabled = false }) {
  const inputId = useId();
  const charCount = value.length;

  const isTooShort = charCount > 0 && charCount < MIN_JD_CHARS;
  const isTooLong = charCount > MAX_JD_CHARS;
  const isValid = charCount >= MIN_JD_CHARS && charCount <= MAX_JD_CHARS;

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5"
        >
          <span>Job Description</span>
          <span className="text-coral font-bold" aria-hidden="true">*</span>
        </label>
        <span
          className={`text-xs font-medium ${
            isTooLong
              ? 'text-coral font-bold'
              : isTooShort
              ? 'text-orange font-semibold'
              : 'text-ink-muted'
          }`}
          aria-live="polite"
        >
          {charCount.toLocaleString()} / {MAX_JD_CHARS.toLocaleString()} characters
        </span>
      </div>

      <p className="text-xs text-ink-muted leading-relaxed">
        Put one requirement per line for the best results.
      </p>

      <div className="relative flex-1 flex flex-col min-h-[260px]">
        <textarea
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g.&#10;Design and build scalable RESTful APIs with Python.&#10;Experience with relational databases (PostgreSQL/MySQL).&#10;Hands-on proficiency with Docker and containerization.&#10;Deploying cloud infrastructure on AWS..."
          className={`w-full flex-1 p-4 text-xs sm:text-sm rounded-2xl border bg-surface-warm text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-amber focus:border-amber focus:outline-none transition-all resize-y min-h-[220px] ${
            isTooLong
              ? 'border-coral ring-1 ring-coral/50'
              : isTooShort
              ? 'border-orange ring-1 ring-orange/30'
              : 'border-surface-border'
          }`}
          aria-invalid={!isValid && charCount > 0}
          aria-describedby={`${inputId}-hint`}
        />
      </div>

      {/* Inline validation messages */}
      {isTooShort && (
        <div id={`${inputId}-hint`} className="flex items-center gap-1.5 text-xs text-orange font-medium pt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Job description is too short ({charCount} / {MIN_JD_CHARS} min characters).</span>
        </div>
      )}
      {isTooLong && (
        <div id={`${inputId}-hint`} className="flex items-center gap-1.5 text-xs text-coral font-medium pt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Job description exceeds maximum limit of {MAX_JD_CHARS.toLocaleString()} characters.</span>
        </div>
      )}
    </div>
  );
}
