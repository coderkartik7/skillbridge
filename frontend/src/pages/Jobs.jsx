import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Globe,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { listUserRoadmaps, getUserRoadmap, searchJobs } from '../api/client';
import useDebounce from '../hooks/useDebounce';
import JobCard from '../components/JobCard';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';

const COMPANY_TIERS = ['All', 'FAANG', 'Top MNC', 'Government', 'Startup', 'Unicorn', 'Other'];

/**
 * /jobs Screen (Protected):
 * - Top controls: select of user's saved roadmaps (role context, default newest; if none, empty state with CTA)
 * - Location text input
 * - Remote toggle
 * - Category filter chips: All, FAANG, Top MNC, Government, Startup, Unicorn, Other
 * - Active skills = roadmap's "skills" UNION skill names of steps whose topics are ALL done
 * - "Matching against N skills you have so far"
 * - Debounce filter changes (400ms) and re-fetch
 * - Job cards, skeleton loaders, empty state, friendly error with retry
 */
export default function Jobs() {
  const navigate = useNavigate();

  // Saved roadmaps list state
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('');
  const [currentRoadmapDetail, setCurrentRoadmapDetail] = useState(null);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(true);

  // Filters
  const [locationInput, setLocationInput] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [selectedTier, setSelectedTier] = useState('All');

  // Debounced filters (400ms)
  const debouncedLocation = useDebounce(locationInput, 400);

  // Jobs search results state
  const [jobsData, setJobsData] = useState({ count: 0, jobs: [] });
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch user's saved roadmaps on mount
  useEffect(() => {
    async function loadRoadmaps() {
      setIsLoadingRoadmaps(true);
      try {
        const data = await listUserRoadmaps();
        const list = data.roadmaps || [];
        setRoadmaps(list);
        if (list.length > 0) {
          setSelectedRoadmapId(String(list[0].id));
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load your saved roadmaps.');
      } finally {
        setIsLoadingRoadmaps(false);
      }
    }
    loadRoadmaps();
  }, []);

  // 2. Fetch full roadmap detail whenever selectedRoadmapId changes
  useEffect(() => {
    if (!selectedRoadmapId) return;

    async function loadRoadmapDetail() {
      try {
        const detail = await getUserRoadmap(selectedRoadmapId);
        setCurrentRoadmapDetail(detail);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load roadmap details.');
      }
    }
    loadRoadmapDetail();
  }, [selectedRoadmapId]);

  // 3. Compute active skills: resume skills UNION fully-completed step skill names
  const activeSkills = useMemo(() => {
    if (!currentRoadmapDetail) return [];

    const resumeSkills = currentRoadmapDetail.skills || [];
    const steps = currentRoadmapDetail.roadmap?.steps || [];
    const progress = currentRoadmapDetail.progress || [];

    const completedSkills = [];
    for (const step of steps) {
      const allDone = step.topics.every((topic) => {
        const p = progress.find(
          (item) => item.skill === step.skill && item.topic === topic.name
        );
        return !!p?.done;
      });
      if (allDone) {
        completedSkills.push(step.skill);
      }
    }

    // Return union (case-insensitive deduplication)
    const set = new Set();
    const result = [];

    for (const s of [...resumeSkills, ...completedSkills]) {
      const key = s.trim().toLowerCase();
      if (!set.has(key)) {
        set.add(key);
        result.push(s);
      }
    }
    return result;
  }, [currentRoadmapDetail]);

  // 4. Fetch jobs whenever activeSkills, debouncedLocation, isRemote, or selectedTier changes
  const fetchJobs = useCallback(async () => {
    if (!currentRoadmapDetail) return;

    setIsSearchingJobs(true);
    setErrorMessage('');
    try {
      const res = await searchJobs({
        role_code: currentRoadmapDetail.roadmap?.role?.code || currentRoadmapDetail.role_code,
        skills: activeSkills,
        location: debouncedLocation,
        remote: isRemote,
        tier: selectedTier,
      });
      setJobsData(res);
    } catch (err) {
      setErrorMessage(err.message || 'Could not fetch job openings. Please retry.');
    } finally {
      setIsSearchingJobs(false);
    }
  }, [currentRoadmapDetail, activeSkills, debouncedLocation, isRemote, selectedTier]);

  useEffect(() => {
    if (currentRoadmapDetail) {
      fetchJobs();
    }
  }, [fetchJobs]);

  if (isLoadingRoadmaps) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-ink">Loading job opportunities...</p>
      </div>
    );
  }

  // If user has no saved roadmaps yet
  if (!isLoadingRoadmaps && roadmaps.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 w-full text-center p-8 sm:p-12 bg-surface rounded-2xl border border-surface-border shadow-soft">
        <div className="w-12 h-12 rounded-2xl bg-cream border border-amber/40 flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-6 h-6 text-ink" />
        </div>
        <h2 className="text-xl font-bold text-ink mb-2">No Active Roadmap Context</h2>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed mb-6">
          To see openings matched directly against your skill set, analyze a resume and save your first target role roadmap.
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
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Top Controls Bar */}
      <div className="bg-surface rounded-2xl border border-surface-border p-5 sm:p-6 mb-8 shadow-soft space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted bg-cream px-2 py-0.5 rounded-md">
              Live Job Matcher
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Targeted Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Openings ranked and analyzed by your current verified skills and completed roadmap milestones.
          </p>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-surface-border">
          {/* 1. Target Role Roadmap Select */}
          <div>
            <label htmlFor="target-roadmap-select" className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Target Role Context
            </label>
            <select
              id="target-roadmap-select"
              value={selectedRoadmapId}
              onChange={(e) => setSelectedRoadmapId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-surface-border bg-surface-warm text-ink focus:ring-2 focus:ring-amber focus:border-amber focus:outline-none transition-colors"
            >
              {roadmaps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role_title} ({r.percent}% completed)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Location Input */}
          <div>
            <label htmlFor="job-location-input" className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
              Location
            </label>
            <div className="relative">
              <input
                id="job-location-input"
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="e.g. San Francisco, Bengaluru, London"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-surface-border bg-surface-warm text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-amber focus:border-amber focus:outline-none transition-colors"
              />
              <MapPin className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* 3. Remote Only Toggle */}
          <div className="flex flex-col justify-end">
            <label
              htmlFor="remote-only-checkbox"
              className="flex items-center gap-3 p-2.5 rounded-xl border border-surface-border bg-surface-warm cursor-pointer hover:border-amber transition-colors"
            >
              <input
                id="remote-only-checkbox"
                type="checkbox"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
                className="w-4 h-4 rounded text-amber focus:ring-amber border-surface-border"
              />
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ink">
                <Globe className="w-4 h-4 text-ink-muted" />
                <span>Remote roles only</span>
              </div>
            </label>
          </div>
        </div>

        {/* Company Tier Filter Chips */}
        <div className="pt-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2">
            Company Tier
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {COMPANY_TIERS.map((tier) => {
              const isSelected = selectedTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-amber ${
                    isSelected
                      ? 'bg-amber text-ink shadow-soft-sm border border-amber'
                      : 'bg-surface text-ink-muted hover:text-ink hover:bg-cream border border-surface-border'
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Skills Info Banner */}
        <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber" />
            <span>
              Matching against <strong className="text-ink">{activeSkills.length} skills</strong> you have so far.
            </span>
          </div>
          {jobsData.count > 0 && !isSearchingJobs && (
            <span className="font-semibold text-ink">
              Showing {jobsData.jobs.length} of {jobsData.count} openings
            </span>
          )}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isSearchingJobs && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-surface rounded-2xl border border-surface-border p-6 shadow-soft animate-pulse flex flex-col justify-between h-64"
            >
              <div>
                <div className="w-20 h-4 bg-surface-border rounded mb-3" />
                <div className="w-48 h-6 bg-surface-border rounded mb-2" />
                <div className="w-32 h-4 bg-surface-border rounded" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-2 bg-surface-border rounded" />
                <div className="w-28 h-4 bg-surface-border rounded" />
              </div>
              <div className="w-full h-10 bg-surface-border rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error with Retry */}
      {!isSearchingJobs && errorMessage && (
        <div className="max-w-xl mx-auto my-8 w-full">
          <ErrorAlert message={errorMessage} onRetry={fetchJobs} />
        </div>
      )}

      {/* Empty State */}
      {!isSearchingJobs && !errorMessage && jobsData.jobs.length === 0 && (
        <EmptyState
          title="No openings found"
          description="Try selecting another location, toggling remote roles, or clearing the company tier filter."
          actionText="Reset filters"
          onAction={() => {
            setLocationInput('');
            setIsRemote(false);
            setSelectedTier('All');
          }}
        />
      )}

      {/* Jobs Grid */}
      {!isSearchingJobs && !errorMessage && jobsData.jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobsData.jobs.map((job, idx) => (
            <JobCard key={`${job.company}-${idx}`} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
