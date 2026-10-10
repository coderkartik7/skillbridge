import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * EvidenceList component:
 * - Up to 3 evidence rows showing the JD requirement and the matching resume line in quoted muted style
 * - "Not clearly shown in the resume" section showing unmet requirements (neutral wording, never "failed" or "rejected")
 *
 * @param {{
 *   evidence?: Array<{ requirement: string, evidence: string, similarity: number }>,
 *   unmet?: string[]
 * }} props
 */
export default function EvidenceList({ evidence = [], unmet = [] }) {
  return (
    <div className="space-y-4 text-xs">
      {/* Evidence supported */}
      {evidence.length > 0 && (
        <div className="space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Matching Evidence from Resume
          </div>
          <div className="space-y-2.5">
            {evidence.map((item, idx) => (
              <div
                key={`ev-${idx}`}
                className="p-3 rounded-xl bg-surface-warm/80 border border-surface-border space-y-1.5"
              >
                <div className="flex items-start gap-2 text-ink font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{item.requirement}</span>
                </div>
                {item.evidence && (
                  <blockquote className="pl-5 border-l-2 border-amber/60 text-ink-muted italic font-normal leading-relaxed text-[11px]">
                    &ldquo;{item.evidence}&rdquo;
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unmet / Not clearly shown */}
      {unmet.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-orange" />
            <span>Not clearly shown in the resume</span>
          </div>
          <ul className="space-y-1.5 pl-1">
            {unmet.map((item, idx) => (
              <li
                key={`unmet-${idx}`}
                className="flex items-start gap-2 text-ink-muted text-xs leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange/60 mt-1.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
