import React from 'react';
import { MapPin, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * JobCard Component:
 * - title, company, location, tier badges
 *   (FAANG/Top MNC = ink-outline, Government = orange, Startup/Unicorn = amber, Other = neutral)
 * - skill-match bar when skill_match_pct is not null (otherwise neutral "Match unknown")
 * - highlighted line "Needs N more skills" with up to 5 missing-skill chips when needs_more is not null
 * - "needs_more = 0" shows green-amber "You're ready to apply" badge
 * - "Apply" opens url in new tab
 */
export default function JobCard({ job }) {
  const {
    title,
    company,
    location,
    url,
    tiers = [],
    skill_match_pct,
    missing_skills = [],
    needs_more,
  } = job;

  // Helper for tier badge styles
  const getTierBadgeStyle = (tier) => {
    switch (tier) {
      case 'FAANG':
      case 'Top MNC':
        return 'border-ink text-ink bg-surface';
      case 'Government':
        return 'border-orange/60 text-ink bg-orange/20';
      case 'Startup':
      case 'Unicorn':
        return 'border-amber/70 text-ink bg-amber/25';
      default:
        return 'border-surface-border text-ink-muted bg-cream/40';
    }
  };

  const isReadyToApply = needs_more === 0;

  return (
    <div className="bg-surface rounded-2xl border border-surface-border p-5 sm:p-6 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between gap-5">
      {/* Top Row: Title, Company, Tiers */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {tiers.map((tier) => (
            <span
              key={tier}
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTierBadgeStyle(
                tier
              )}`}
            >
              {tier}
            </span>
          ))}
          {location && (
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted ml-auto">
              <MapPin className="w-3 h-3 text-ink-muted" />
              <span>{location}</span>
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-ink leading-snug mb-1">{title}</h3>
        <p className="text-xs sm:text-sm font-medium text-ink-muted">{company}</p>
      </div>

      {/* Middle: Skill Match & Missing Skills */}
      <div className="space-y-3 pt-3 border-t border-surface-border">
        {/* Match Percentage */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-ink-muted">Skill match</span>
            {skill_match_pct !== null && skill_match_pct !== undefined ? (
              <span className="font-bold text-ink">{skill_match_pct}% match</span>
            ) : (
              <span className="text-ink-muted font-medium">Match unknown</span>
            )}
          </div>

          {skill_match_pct !== null && skill_match_pct !== undefined ? (
            <div className="w-full h-2 bg-surface-border rounded-full overflow-hidden">
              <div
                className="h-full bg-amber rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, skill_match_pct)}%` }}
              />
            </div>
          ) : (
            <div className="w-full h-1.5 bg-surface-border/50 rounded-full" />
          )}
        </div>

        {/* Needs more / Ready banner */}
        {isReadyToApply ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber/20 border border-amber/40 text-xs font-bold text-ink">
            <CheckCircle2 className="w-4 h-4 text-ink flex-shrink-0" />
            <span>You're ready to apply! Your profile covers all key skills.</span>
          </div>
        ) : needs_more !== null && needs_more !== undefined ? (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-2">
              <AlertCircle className="w-3.5 h-3.5 text-orange" />
              <span>Needs {needs_more} more skill{needs_more === 1 ? '' : 's'}</span>
            </div>

            {missing_skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {missing_skills.slice(0, 5).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-lg bg-surface-warm border border-surface-border text-[11px] font-medium text-ink-muted"
                  >
                    {skill}
                  </span>
                ))}
                {missing_skills.length > 5 && (
                  <span className="text-[11px] text-ink-muted self-center">
                    +{missing_skills.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Bottom Action: Apply */}
      <div className="pt-2">
        <a
          href={url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-ink bg-cream hover:bg-amber/40 border border-surface-border hover:border-amber transition-all shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-amber"
        >
          <span>Apply now</span>
          <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
        </a>
      </div>
    </div>
  );
}
