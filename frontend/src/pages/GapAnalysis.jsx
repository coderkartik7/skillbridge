import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getGapAnalysis } from '../api/client';
import Layout from '../components/Layout';
import {
  ArrowLeft,
  RotateCcw,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  BookOpen,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';

export default function GapAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();

  const occupationCode = location.state?.occupationCode;
  const occupationTitle = location.state?.occupationTitle || occupationCode;
  const matchScore = location.state?.matchScore;
  const text = location.state?.text;

  const [loading, setLoading] = useState(true);
  const [missingSkills, setMissingSkills] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If required state is missing, stop early
    if (!occupationCode || !text) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchGap() {
      setLoading(true);
      setError(null);
      try {
        const data = await getGapAnalysis(occupationCode, text);
        if (isMounted) {
          setMissingSkills(data.missing_skills || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError(err.message || 'Failed to retrieve skill gap analysis.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchGap();

    return () => {
      isMounted = false;
    };
  }, [occupationCode, text]);

  // Graceful fallback for direct page reload without state
  if (!occupationCode || !text) {
    return (
      <Layout currentStep={3}>
        <div className="max-w-md mx-auto text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Session Expired or Missing Data</h2>
          <p className="text-sm text-slate-600">
            Please start from the resume input screen to select an occupation and analyze your skill gap.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Start Over
          </Link>
        </div>
      </Layout>
    );
  }

  const trendingCount = missingSkills.filter((s) => s.is_trending).length;

  return (
    <Layout currentStep={3}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Match Results
          </button>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Start Over
          </button>
        </div>

        {/* Occupation Target Card */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white/10 text-blue-200 border border-white/10 font-mono">
                {occupationCode}
              </span>
              {matchScore && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {matchScore}% Profile Match
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Skill Gap for {occupationTitle}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Here are the key competencies, tools, and specialized skills required for this occupation that were not detected in your profile text.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900">Analyzing Missing Skills...</h3>
              <p className="text-xs text-slate-500">Cross-referencing your resume against occupation knowledge models</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-rose-900">Analysis Error</h3>
                <p className="text-xs sm:text-sm text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 hover:bg-rose-100/50 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Success State */}
        {!loading && !error && (
          <>
            {/* Stats bar */}
            {missingSkills.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>{missingSkills.length} Skills Recommended</span>
                  {trendingCount > 0 && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md inline-flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                      {trendingCount} High Demand / Hot Tech
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  Ranked by trending demand & relevance
                </span>
              </div>
            )}

            {/* Empty case: No missing skills */}
            {missingSkills.length === 0 ? (
              <div className="bg-white rounded-2xl border border-emerald-200 p-8 sm:p-10 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-slate-900">Outstanding Match!</h3>
                  <p className="text-sm text-slate-600">
                    You already have all the key skills identified for this role. Your profile demonstrates comprehensive coverage of core competencies.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/matches', { state: { matches: location.state?.matches, text } })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Explore Other Occupations
                  </button>
                </div>
              </div>
            ) : (
              /* Missing Skills List */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {missingSkills.map((skill, index) => {
                  const relevanceScore = skill.relevance || 0;
                  // relevance roughly 1-6 scale -> convert to percentage of 6
                  const relevancePct = Math.min(100, Math.round((relevanceScore / 6.0) * 100));

                  return (
                    <div
                      key={skill.skill_id || index}
                      className={`bg-white rounded-xl p-4 sm:p-5 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 ${
                        skill.is_trending
                          ? 'border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/30 ring-1 ring-amber-100'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base capitalize leading-snug">
                            {skill.skill_name}
                          </h3>

                          {skill.is_trending && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs shrink-0">
                              <Flame className="w-3 h-3 fill-white" />
                              Hot Tech
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Relevance rating bar */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-slate-500">
                          Importance / Relevance:
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${relevancePct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">
                            {relevanceScore.toFixed(1)}/6
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
