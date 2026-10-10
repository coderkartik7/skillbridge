import React, { useRef, useState } from 'react';
import { Upload as UploadIcon, FileText, X, AlertCircle } from 'lucide-react';
import { formatBytes } from '../../lib/format';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_CANDIDATES = 50;

/**
 * ResumeUploader component:
 * - Drag-and-drop zone for multiple PDF/DOCX files
 * - Client-side validation: type check (.pdf, .docx, .doc) and 5 MB per file
 * - List of chosen files with name, size, and remove button
 * - Running count "{count} of 50" candidates
 * - Toggle "Or paste resume text" revealing textarea with hint:
 *   "Separate several resumes with a line containing only ---"
 *
 * @param {{
 *   files: File[],
 *   onFilesChange: (files: File[]) => void,
 *   pastedText: string,
 *   onPastedTextChange: (text: string) => void,
 *   pastedCandidateCount: number,
 *   disabled?: boolean,
 * }} props
 */
export default function ResumeUploader({
  files = [],
  onFilesChange,
  pastedText = '',
  onPastedTextChange,
  pastedCandidateCount = 0,
  disabled = false,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPastedText, setShowPastedText] = useState(!!pastedText);
  const [fileError, setFileError] = useState('');

  const totalCandidateCount = files.length + pastedCandidateCount;
  const isOverLimit = totalCandidateCount > MAX_TOTAL_CANDIDATES;

  const validateAndAddFiles = (newFiles) => {
    setFileError('');
    if (!newFiles || newFiles.length === 0) return;

    const validExtensions = ['.pdf', '.docx', '.doc'];
    const accepted = [];
    const rejected = [];

    Array.from(newFiles).forEach((f) => {
      const extValid = validExtensions.some((ext) => f.name.toLowerCase().endsWith(ext));
      if (!extValid) {
        rejected.push(`${f.name} (unsupported format)`);
        return;
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        rejected.push(`${f.name} (> 5 MB)`);
        return;
      }
      // Avoid duplicate file names if possible
      const alreadyChosen = files.some((existing) => existing.name === f.name && existing.size === f.size);
      if (!alreadyChosen) {
        accepted.push(f);
      }
    });

    if (rejected.length > 0) {
      setFileError(`Skipped: ${rejected.join(', ')}`);
    }

    if (accepted.length > 0) {
      const combined = [...files, ...accepted];
      if (combined.length + pastedCandidateCount > MAX_TOTAL_CANDIDATES) {
        setFileError(`Maximum limit is ${MAX_TOTAL_CANDIDATES} candidates in total.`);
      }
      onFilesChange(combined.slice(0, MAX_TOTAL_CANDIDATES));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Header with running count */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
          <span>Resumes</span>
          <span className="text-coral font-bold" aria-hidden="true">*</span>
        </label>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
            isOverLimit
              ? 'bg-coral/20 text-coral border-coral/40'
              : totalCandidateCount > 0
              ? 'bg-cream text-ink border-amber/40'
              : 'bg-surface-warm text-ink-muted border-surface-border'
          }`}
          aria-live="polite"
        >
          {totalCandidateCount} of {MAX_TOTAL_CANDIDATES} candidates
        </span>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !disabled && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Drag and drop PDF or DOCX resumes here or click to browse"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-amber bg-cream/40 scale-[0.99]'
            : 'border-surface-border hover:border-amber/70 hover:bg-cream/15'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) {
              validateAndAddFiles(e.target.files);
              e.target.value = ''; // Reset input to allow re-upload
            }
          }}
        />

        <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center mx-auto mb-2 shadow-soft-sm">
          <UploadIcon className="w-5 h-5 text-ink" aria-hidden="true" />
        </div>
        <p className="text-xs sm:text-sm font-bold text-ink">
          Drag & drop resumes here, or <span className="underline decoration-amber underline-offset-2">browse</span>
        </p>
        <p className="text-[11px] text-ink-muted mt-0.5">
          PDF or DOCX (max 5 MB each, up to 50 resumes)
        </p>
      </div>

      {/* File validation warning */}
      {fileError && (
        <div className="flex items-start gap-1.5 text-xs text-coral font-medium p-2.5 rounded-xl bg-coral/10 border border-coral/30">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{fileError}</span>
        </div>
      )}

      {/* List of chosen files */}
      {files.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-1">
            Attached Files ({files.length})
          </div>
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between p-2.5 rounded-xl bg-surface-warm border border-surface-border text-xs"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <FileText className="w-4 h-4 text-ink flex-shrink-0" />
                <span className="font-semibold text-ink truncate">{file.name}</span>
                <span className="text-[11px] text-ink-muted flex-shrink-0">
                  ({formatBytes(file.size)})
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(idx);
                }}
                disabled={disabled}
                aria-label={`Remove file ${file.name}`}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-coral/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Toggle to paste resume text */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowPastedText(!showPastedText)}
          className="text-xs text-ink-muted hover:text-ink font-semibold underline underline-offset-4 decoration-surface-border transition-colors focus:outline-none"
        >
          {showPastedText ? 'Hide pasted resume text' : 'Or paste resume text directly'}
        </button>

        {showPastedText && (
          <div className="mt-2.5 space-y-1.5">
            <p className="text-[11px] text-ink-muted">
              Separate several resumes with a line containing only <code className="bg-cream px-1 py-0.5 rounded text-ink font-bold">---</code>
            </p>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => onPastedTextChange(e.target.value)}
              disabled={disabled}
              placeholder="Candidate 1 resume text...&#10;&#10;---&#10;&#10;Candidate 2 resume text..."
              className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-surface-border bg-surface-warm text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-amber focus:border-amber focus:outline-none resize-y"
              aria-label="Pasted resumes text content"
            />
          </div>
        )}
      </div>
    </div>
  );
}
