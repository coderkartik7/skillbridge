import React from 'react';
import { Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Layout({ currentStep = 1, children }) {
  const steps = [
    { number: 1, title: 'Input Skills', desc: 'Paste resume or skills' },
    { number: 2, title: 'Match Roles', desc: 'Top career matches' },
    { number: 3, title: 'Skill Gap', desc: 'Personalized gap analysis' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                SkillBridge
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                AI Navigator
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              Stateless & Privacy-First
            </span>
          </div>
        </div>
      </header>

      {/* Progress / Step Navigation Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between w-full">
              {steps.map((step, idx) => {
                const isCompleted = step.number < currentStep;
                const isCurrent = step.number === currentStep;

                return (
                  <li key={step.number} className="relative flex-1 flex items-center">
                    <div className="flex items-center gap-2 sm:gap-3 group">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                      </span>
                      <div className="hidden sm:flex flex-col text-left">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isCurrent
                              ? 'text-blue-600'
                              : isCompleted
                              ? 'text-slate-900'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.title}
                        </span>
                        <span className="text-[11px] text-slate-500">{step.desc}</span>
                      </div>
                    </div>

                    {idx < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                          step.number < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} SkillBridge — Intelligent Career Skill Gap Analysis</p>
          <p className="text-slate-400">Powered by FastAPI & ONET Intelligence</p>
        </div>
      </footer>
    </div>
  );
}
