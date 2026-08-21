import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchOccupations } from '../api/client';
import Layout from '../components/Layout';
import { Sparkles, ArrowRight, FileText, AlertCircle, Loader2 } from 'lucide-react';

const SAMPLE_TEXTS = [
  {
    label: 'Data Science & ML',
    text: 'Experienced in Python, SQL, pandas, scikit-learn, machine learning, data visualization, exploratory data analysis, statistics, deep learning, PyTorch, and cloud computing with AWS.'
  },
  {
    label: 'Full Stack Web Dev',
    text: 'Proficient in JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, MongoDB, RESTful APIs, Docker, Git, CI/CD pipelines, HTML5, CSS3, and Tailwind CSS.'
  },
  {
    label: 'Healthcare & Clinical Data',
    text: 'Background in clinical data management, healthcare informatics, electronic health records (EHR), medical terminology, SAS, statistical reporting, data validation, and FDA regulations.'
  }
];

export default function ResumeInput() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const data = await matchOccupations(text.trim());
      // Navigate to match results screen passing matches and original text
      navigate('/matches', {
        state: {
          matches: data.matches || [],
          text: text.trim(),
        },
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to match occupations. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleText) => {
    setText(sampleText);
    setError(null);
  };

  return (
    <Layout currentStep={1}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Intro */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Step 1: Discover Your Career Match
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Map Your Skills to Top Occupations
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Paste your resume, CV summary, or list of technical skills below. Our AI engine matches your profile with industry roles and pinpoints skill gaps.
          </p>
        </div>

        {/* Quick sample chips */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Try a Quick Sample:
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleSampleClick(sample.text)}
                className="text-xs bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="resume-text" className="block text-sm font-semibold text-slate-800">
                Resume or Skills Description <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">
                {text.length} characters
              </span>
            </div>
            
            <textarea
              id="resume-text"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. 5+ years building backend microservices with Python, FastAPI, Docker, and PostgreSQL. Experienced with machine learning pipelines, NumPy, Pandas, Scikit-Learn, data modeling, CI/CD with GitHub Actions..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-y text-sm sm:text-base font-normal leading-relaxed"
              disabled={loading}
              required
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Match Request Failed</p>
                <p className="text-rose-700 text-xs sm:text-sm mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 order-2 sm:order-1 text-center sm:text-left">
              🔒 No resume data is saved or stored on our servers.
            </p>
            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Skills & Matching...
                </>
              ) : (
                <>
                  Find Matches
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
