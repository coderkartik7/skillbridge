import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Clock, Plus } from 'lucide-react';
import { listUserRoadmaps } from '../api/client';
import ProgressRing from '../components/ProgressRing';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';

/**
 * /dashboard screen (protected)
 * - "Your roadmaps" grid of cards: role title, created date, circular progress ring with percent, "Open" action
 * - Empty state: friendly illustration-free message with button "Analyze a resume"
 * - "New analysis" button goes to "/"
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchRoadmaps = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await listUserRoadmaps();
      setRoadmaps(data.roadmaps || []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load your saved roadmaps.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Top Header */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 sm:p-8 mb-8 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-cream px-2 py-0.5 rounded-md">
                Personal Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Your Learning Journeys</h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Track your skill progression, revisit curated resources, and stay resilient.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber hover:bg-amber/90 active:scale-[0.99] font-bold text-xs sm:text-sm text-ink shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-amber"
          >
            <Plus className="w-4 h-4" />
            <span>New analysis</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-surface rounded-2xl border border-surface-border p-6 shadow-soft animate-pulse flex flex-col justify-between h-48"
            >
              <div>
                <div className="w-24 h-4 bg-surface-border rounded mb-3" />
                <div className="w-48 h-6 bg-surface-border rounded mb-2" />
                <div className="w-32 h-3 bg-surface-border rounded" />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-surface-border">
                <div className="w-10 h-10 rounded-full bg-surface-border" />
                <div className="w-20 h-8 rounded-xl bg-surface-border" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {!isLoading && errorMessage && (
        <div className="max-w-xl mx-auto my-8 w-full">
          <ErrorAlert message={errorMessage} onRetry={fetchRoadmaps} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && roadmaps.length === 0 && (
        <div className="bg-surface rounded-2xl border border-surface-border p-10 sm:p-14 text-center max-w-xl mx-auto my-12 shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-cream border border-amber/40 flex items-center justify-center mx-auto mb-4 shadow-soft-sm">
            <BookOpen className="w-6 h-6 text-ink" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">No saved roadmaps yet</h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed mb-6">
            Upload your resume to discover your risk profile and generate an interactive skill bridge for your target role.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber hover:bg-amber/90 font-bold text-sm text-ink shadow-soft transition-all focus:ring-2 focus:ring-amber"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze a resume</span>
          </button>
        </div>
      )}

      {/* Roadmaps Grid */}
      {!isLoading && !errorMessage && roadmaps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((r) => (
            <div
              key={r.id}
              className="bg-surface rounded-2xl border border-surface-border p-6 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between gap-6 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted bg-cream px-2 py-0.5 rounded-md">
                    Roadmap #{r.id}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                    <Clock className="w-3 h-3 text-ink-muted" />
                    <span>{formatDate(r.created_at)}</span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-ink leading-snug group-hover:text-amber-900 transition-colors">
                  {r.role_title}
                </h2>
              </div>

              {/* Bottom: Progress Ring + Open action */}
              <div className="pt-4 border-t border-surface-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ProgressRing percent={r.percent} size={44} strokeWidth={3.5} />
                  <div className="text-xs">
                    <div className="font-bold text-ink">{r.percent}% completed</div>
                    <div className="text-ink-muted text-[11px]">Skill progression</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/${r.id}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-ink bg-cream hover:bg-amber/50 border border-surface-border hover:border-amber transition-all shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-amber"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
