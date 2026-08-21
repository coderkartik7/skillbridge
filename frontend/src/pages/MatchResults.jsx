import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowLeft, ArrowRight, Briefcase, Award, AlertTriangle, Sparkles, CheckCircle } from 'lucide-react';

export default function MatchResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const matches = location.state?.matches;
  const originalText = location.state?.text;

  // Graceful redirect if accessed directly without state
  if (!originalText || !Array.isArray(matches)) {
    return (
      <Layout currentStep={2}>
        <div className="max-w-md mx-auto text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">No Match Data Found</h2>
          <p className="text-sm text-slate-600">
            Please enter your resume text first so we can calculate your career matches.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Resume Input
          </Link>
        </div>
      </Layout>
    );
  }

  const handleSelectOccupation = (occupationCode, occupationTitle, matchScore) => {
    navigate('/gap', {
      state: {
        occupationCode,
        occupationTitle,
        matchScore,
        text: originalText,
      },
    });
  };

  return (
    <Layout currentStep={2}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top bar with back button & header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Step 2: Top Occupations
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Your Top Role Matches
            </h1>
            <p className="text-slate-600 text-sm">
              Based on your skills profile, here are the top matching career paths ranked by relevance.
            </p>
          </div>

          <button
            onClick={() => navigate('/', { state: { text: originalText } })}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Edit Resume Text
          </button>
        </div>

        {/* Empty state */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Occupation Matches Found</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              We couldn't find close matches for the provided text. Try adding more detailed descriptions of your skills and work experience.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          /* Matches list */
          <div className="space-y-3.5">
            {matches.map((item, index) => {
              const [code, title, score] = item;
              const percentage = Math.min(100, Math.max(0, Math.round(score * 100)));

              // Badge color based on percentage
              const isTop = index === 0;

              return (
                <div
                  key={code || index}
                  className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                    isTop
                      ? 'border-blue-300 ring-1 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                        {code}
                      </span>
                      {isTop && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          Best Match
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {title}
                    </h2>

                    {/* Score Bar */}
                    <div className="flex items-center gap-3 max-w-xs">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage >= 60
                              ? 'bg-emerald-500'
                              : percentage >= 40
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                        {percentage}% match ({score.toFixed(3)})
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleSelectOccupation(code, title, percentage)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm group-hover:shadow-md shrink-0 cursor-pointer"
                  >
                    See Skill Gap
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
