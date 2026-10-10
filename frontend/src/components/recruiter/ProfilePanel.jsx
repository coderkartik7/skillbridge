import React, { useState } from 'react';
import {
  Code2,
  Trophy,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { enrichCandidate } from '../../api/client';
import Spinner from '../Spinner';

/**
 * Clean SVG for GitHub icon
 */
function GitHubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

/**
 * ProfilePanel component:
 * - 3 inputs prefilled from handles (GitHub, Codeforces, LeetCode) - editable
 * - Accepts username or pasted profile URL
 * - "Fetch profile" button calling enrichCandidate
 * - Per-source mini cards:
 *   - GitHub (repos, active repos, languages, stars, top 3 repos as links)
 *   - Codeforces (rank, rating, max rating, contests)
 *   - LeetCode (solved with easy/medium/hard, contests; if status is "disabled" show nothing)
 * - Status states:
 *   - not_provided: hide card
 *   - not_found: "Profile not found"
 *   - invalid: "Check the username"
 *   - unavailable: reason with Retry
 * - Summary sentence above cards
 * - Note under panel: "Public profile data is shown for context only. It does not affect the ranking."
 *
 * @param {{
 *   initialHandles?: { github?: string|null, codeforces?: string|null, leetcode?: string|null }
 * }} props
 */
export default function ProfilePanel({ initialHandles = {} }) {
  const [handles, setHandles] = useState({
    github: initialHandles?.github || '',
    codeforces: initialHandles?.codeforces || '',
    leetcode: initialHandles?.leetcode || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [enrichData, setEnrichData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFetch = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await enrichCandidate({
        github: handles.github,
        codeforces: handles.codeforces,
        leetcode: handles.leetcode,
      });
      setEnrichData(data);
    } catch (err) {
      setErrorMsg(err.message || 'Could not fetch developer profiles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const gh = enrichData?.github;
  const cf = enrichData?.codeforces;
  const lc = enrichData?.leetcode;

  return (
    <div className="mt-4 pt-4 border-t border-surface-border space-y-4">
      {/* Input row */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2">
          Public Developer Profiles
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label htmlFor="gh-input" className="block text-[11px] font-semibold text-ink-muted mb-1">
              GitHub handle / URL
            </label>
            <input
              id="gh-input"
              type="text"
              value={handles.github}
              onChange={(e) => setHandles({ ...handles, github: e.target.value })}
              placeholder="e.g. torvalds"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-surface-border bg-surface-warm text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-amber focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="cf-input" className="block text-[11px] font-semibold text-ink-muted mb-1">
              Codeforces handle / URL
            </label>
            <input
              id="cf-input"
              type="text"
              value={handles.codeforces}
              onChange={(e) => setHandles({ ...handles, codeforces: e.target.value })}
              placeholder="e.g. tourist"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-surface-border bg-surface-warm text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-amber focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="lc-input" className="block text-[11px] font-semibold text-ink-muted mb-1">
              LeetCode handle / URL
            </label>
            <input
              id="lc-input"
              type="text"
              value={handles.leetcode}
              onChange={(e) => setHandles({ ...handles, leetcode: e.target.value })}
              placeholder="e.g. neetcode"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-surface-border bg-surface-warm text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-amber focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[11px] text-ink-muted">
            Enter username or paste direct profile URL.
          </p>
          <button
            type="button"
            onClick={handleFetch}
            disabled={isLoading || (!handles.github && !handles.codeforces && !handles.leetcode)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber hover:bg-amber/90 active:scale-[0.99] text-ink border border-amber/70 shadow-soft-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-amber focus:outline-none"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{enrichData ? 'Refresh profiles' : 'Fetch profiles'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-coral/10 border border-coral/30 text-xs text-ink flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={handleFetch}
            className="text-xs font-bold underline ml-2 hover:text-coral"
          >
            Retry
          </button>
        </div>
      )}

      {/* Enrich Results Area */}
      {enrichData && (
        <div className="space-y-3 pt-2">
          {/* Summary sentence */}
          {enrichData.summary && (
            <div className="p-3 rounded-xl bg-cream/40 border border-amber/40 text-xs font-medium text-ink leading-relaxed">
              <strong>Profile Summary:</strong> {enrichData.summary}
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* GitHub Card */}
            {gh && gh.status !== 'not_provided' && (
              <div className="p-3.5 rounded-xl bg-surface border border-surface-border shadow-soft-sm space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-surface-border pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-ink">
                    <GitHubIcon className="w-4 h-4 text-ink" />
                    <span>GitHub</span>
                  </div>
                  {gh.status === 'ok' && gh.url && (
                    <a
                      href={gh.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-muted hover:text-ink inline-flex items-center gap-0.5 text-[11px]"
                      aria-label="Open candidate GitHub profile"
                    >
                      <span>@{gh.handle}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {gh.status === 'ok' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div>
                        <span className="text-ink-muted">Repos: </span>
                        <strong>{gh.repos}</strong>
                        {gh.active_repos !== undefined && (
                          <span className="text-ink-muted text-[10px]"> ({gh.active_repos} active)</span>
                        )}
                      </div>
                      <div>
                        <span className="text-ink-muted">Stars: </span>
                        <strong>{gh.stars || 0}</strong>
                      </div>
                    </div>

                    {gh.top_languages && gh.top_languages.length > 0 && (
                      <div className="text-[11px]">
                        <span className="text-ink-muted">Top languages: </span>
                        <span className="font-semibold">{gh.top_languages.join(', ')}</span>
                      </div>
                    )}

                    {gh.top_repos && gh.top_repos.length > 0 && (
                      <div className="pt-1 border-t border-surface-border space-y-1">
                        <div className="text-[10px] uppercase font-bold text-ink-muted">Top Repos</div>
                        {gh.top_repos.slice(0, 3).map((repo, i) => (
                          <div key={i} className="text-[11px] truncate">
                            <a
                              href={`${gh.url}/${repo.name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-ink hover:underline inline-flex items-center gap-1"
                            >
                              <span>{repo.name}</span>
                              <span className="text-[10px] text-ink-muted font-normal">
                                ★{repo.stars}
                              </span>
                            </a>
                            {repo.description && (
                              <p className="text-[10px] text-ink-muted truncate">{repo.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {gh.status === 'not_found' && (
                  <p className="text-ink-muted italic py-2">Profile not found on GitHub.</p>
                )}
                {gh.status === 'invalid' && (
                  <p className="text-coral font-medium py-2">Check the GitHub username.</p>
                )}
                {gh.status === 'unavailable' && (
                  <div className="py-2 space-y-1.5">
                    <p className="text-ink-muted">{gh.reason || 'GitHub is currently unavailable.'}</p>
                    <button
                      type="button"
                      onClick={handleFetch}
                      className="text-xs font-semibold text-ink underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Codeforces Card */}
            {cf && cf.status !== 'not_provided' && (
              <div className="p-3.5 rounded-xl bg-surface border border-surface-border shadow-soft-sm space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-surface-border pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-ink">
                    <Code2 className="w-4 h-4 text-ink" />
                    <span>Codeforces</span>
                  </div>
                  {cf.status === 'ok' && cf.url && (
                    <a
                      href={cf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-muted hover:text-ink inline-flex items-center gap-0.5 text-[11px]"
                      aria-label="Open candidate Codeforces profile"
                    >
                      <span>@{cf.handle}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {cf.status === 'ok' && (
                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-ink-muted">Rank: </span>
                      <strong className="capitalize">{cf.rank || 'Unrated'}</strong>
                      {cf.max_rank && cf.max_rank !== cf.rank && (
                        <span className="text-ink-muted text-[10px]"> (max: {cf.max_rank})</span>
                      )}
                    </div>
                    <div>
                      <span className="text-ink-muted">Rating: </span>
                      <strong>{cf.rating !== null ? cf.rating : 'None'}</strong>
                      {cf.max_rating && (
                        <span className="text-ink-muted text-[10px]"> (max: {cf.max_rating})</span>
                      )}
                    </div>
                    {cf.contests !== null && cf.contests !== undefined && (
                      <div>
                        <span className="text-ink-muted">Contests: </span>
                        <strong>{cf.contests}</strong>
                      </div>
                    )}
                  </div>
                )}

                {cf.status === 'not_found' && (
                  <p className="text-ink-muted italic py-2">Profile not found on Codeforces.</p>
                )}
                {cf.status === 'invalid' && (
                  <p className="text-coral font-medium py-2">Check the Codeforces username.</p>
                )}
                {cf.status === 'unavailable' && (
                  <div className="py-2 space-y-1.5">
                    <p className="text-ink-muted">{cf.reason || 'Codeforces is currently unavailable.'}</p>
                    <button
                      type="button"
                      onClick={handleFetch}
                      className="text-xs font-semibold text-ink underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* LeetCode Card - If status === 'disabled', do not render */}
            {lc && lc.status !== 'not_provided' && lc.status !== 'disabled' && (
              <div className="p-3.5 rounded-xl bg-surface border border-surface-border shadow-soft-sm space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-surface-border pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-ink">
                    <Trophy className="w-4 h-4 text-ink" />
                    <span>LeetCode</span>
                  </div>
                  {lc.status === 'ok' && lc.url && (
                    <a
                      href={lc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-muted hover:text-ink inline-flex items-center gap-0.5 text-[11px]"
                      aria-label="Open candidate LeetCode profile"
                    >
                      <span>@{lc.handle}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {lc.status === 'ok' && (
                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-ink-muted">Problems Solved: </span>
                      <strong>{lc.solved || 0}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-cream text-ink font-semibold">
                        Easy: {lc.easy || 0}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber/30 text-ink font-semibold">
                        Med: {lc.medium || 0}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-coral/30 text-ink font-semibold">
                        Hard: {lc.hard || 0}
                      </span>
                    </div>
                    {lc.contest_rating && (
                      <div>
                        <span className="text-ink-muted">Contest rating: </span>
                        <strong>{Math.round(lc.contest_rating)}</strong>
                        {lc.contests && (
                          <span className="text-ink-muted text-[10px]"> ({lc.contests} contests)</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {lc.status === 'not_found' && (
                  <p className="text-ink-muted italic py-2">Profile not found on LeetCode.</p>
                )}
                {lc.status === 'invalid' && (
                  <p className="text-coral font-medium py-2">Check the LeetCode username.</p>
                )}
                {lc.status === 'unavailable' && (
                  <div className="py-2 space-y-1.5">
                    <p className="text-ink-muted">{lc.reason || 'LeetCode is currently unavailable.'}</p>
                    <button
                      type="button"
                      onClick={handleFetch}
                      className="text-xs font-semibold text-ink underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory neutrality disclaimer */}
      <div className="text-[11px] text-ink-muted pt-1 flex items-center gap-1.5 italic">
        <HelpCircle className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" />
        <span>Public profile data is shown for context only. It does not affect the ranking.</span>
      </div>
    </div>
  );
}
