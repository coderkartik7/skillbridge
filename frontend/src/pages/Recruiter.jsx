import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Sparkles,
  ArrowLeft,
  Download,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileCheck2,
} from 'lucide-react';
import { screenCandidates } from '../api/client';
import {
  filterCandidates,
  DEFAULT_RECRUITER_FILTERS,
  generateShortlistCsv,
} from '../lib/recruiterFilters';
import JdInput from '../components/recruiter/JdInput';
import ResumeUploader from '../components/recruiter/ResumeUploader';
import ScreeningStatus from '../components/recruiter/ScreeningStatus';
import FilterBar from '../components/recruiter/FilterBar';
import CandidateCard from '../components/recruiter/CandidateCard';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';

// Realistic sample JD: Backend Engineer (Python, REST APIs, cloud and containers)
const DEMO_JD = `Senior Backend Engineer (Platform & Distributed Systems)

We are seeking a seasoned Backend Engineer to scale our core platform microservices and APIs.

Key Responsibilities & Requirements:
- Design and build scalable RESTful APIs and backend microservices using Python.
- Experience with relational databases (PostgreSQL/MySQL), schema design, and query optimization.
- Hands-on proficiency with containerization using Docker and orchestrating services.
- Cloud infrastructure deployment and monitoring on AWS (ECS, S3, RDS, CloudWatch).
- Experience setting up automated CI/CD deployment pipelines (GitHub Actions, GitLab CI).
- Demonstrated understanding of asynchronous task queues (Celery, Redis) and caching strategies.`;

// 6 sample resumes separated by '---'
// Resume 1: Strong fit
// Resume 2: Alex Chen (strong experience in different words)
// Resume 3: Priya Sharma (good fit)
// Resume 4: Rohan Verma (developer, unknown experience)
// Resume 5: Kevin (keyword stuffed dev)
// Resume 6: Sam Taylor (junior dev)
const DEMO_PASTED_RESUMES = `Maya Lin - Senior Platform Engineer
Contact: maya.lin@example.com | github.com/mayalin-dev | leetcode.com/mayacodes
Summary: 6.5 years designing distributed Python web applications and microservices.
Work Experience:
Lead Backend Engineer at CloudScale Inc (2020 - Present, 4.5 years):
- Architected 14 Python-based core microservices handling 45M daily HTTP requests with FastAPI and gRPC.
- Redesigned PostgreSQL relational schema and query indexing strategies, slashing p99 latency from 420ms to 65ms.
- Managed multi-AZ AWS cloud infrastructure including ECS Fargate clusters, RDS Aurora Postgres, and Datadog monitoring.
- Built end-to-end CI/CD release automation with GitHub Actions and Docker.
Senior Software Developer at DataStream (2018 - 2020, 2 years):
- Implemented Celery distributed task workers backed by Redis caching clusters for high-volume invoice processing.

---

Alex Chen - Distributed Systems Engineer
Contact: alex.chen@example.com | github.com/alexchen88 | codeforces.com/profile/tourist_fan
Summary: ~5 years of experience in distributed software systems.
Work Experience:
Backend Architect at FinCommerce:
- Authored resilient distributed web services and HTTP contracts in Python powering enterprise commerce workflows.
- Packaged stateless application layers into isolated container images deployed across container topologies.
- Implemented distributed job scheduling with in-memory key-value stores to guarantee idempotent background processing.
- Optimized relational storage engines with custom SQL indexing and write-ahead transaction logging.
- Collaborated across engineering squads on service-oriented platform boundaries.

---

Priya Sharma - Software Engineer
Contact: priya.sharma@example.com | github.com/priyasharma-code
Summary: 3.2 years of full-stack backend development.
Work Experience:
Software Engineer at NeoTech Labs (2023 - Present, 3.2 years):
- Built REST API endpoints in Django and Flask connected to PostgreSQL data persistence layer.
- Maintained PostgreSQL relational tables, applied Alembic database migrations, and wrote analytical SQL queries.
- Created multi-stage Dockerfiles and local docker-compose environments for development parity.
- Integrated third-party payment APIs and automated smoke testing suites.

---

Rohan Verma - Software Developer
Contact: rohan.v@example.com | github.com/rohanv | codeforces.com/profile/rohan_code
Summary: Software developer passionate about web architectures and code quality.
Work Experience:
Software Developer at Internal Tools Group:
- Contributed Python scripts and JSON web services for internal tooling and data parsing.
- Configured GitHub Actions workflows to run linter checks and automated unit test suites on pull requests.
- Containerized Python web apps using Docker for sandbox testing.
- Participated in database maintenance and documentation of API endpoints.

---

Kevin Buzzword - Full Stack Cloud Ninja
Contact: kevin.buzzword@example.com | github.com/kevin-dev-99 | leetcode.com/kevin99
Summary: 1 year of experience.
Skills: Python, REST, RESTful APIs, Microservices, Cloud, Databases, SQL, PostgreSQL, Docker, Containers, AWS, ECS, CI/CD, Pipelines, Celery, Redis, Kubernetes, Agile, Scrum, Jira.
Experience:
Junior Web Coder at QuickStart (1 year stated):
- Skills summary list: Python, REST, microservices, cloud, databases, containers, agile.
- Used PostgreSQL in college classroom assignment.
- Read tutorials on AWS and Docker containers.

---

Sam Taylor - Junior Developer
Contact: sam.t@example.com
Summary: Recent Computer Science graduate (0.8 years experience).
Experience:
Intern at Academic Computing Lab (2025 - Present, 0.8 years):
- Completed introductory coursework in Python programming and basic HTTP endpoints.
- Used Git version control for team project submissions.
- Enthusiastic about learning modern software engineering methodologies.`;

export default function Recruiter() {
  // Mode: 'setup' | 'results'
  const [viewMode, setViewMode] = useState('setup');

  // SETUP INPUTS
  const [jd, setJd] = useState('');
  const [files, setFiles] = useState([]);
  const [pastedText, setPastedText] = useState('');

  // SCREENING RUNNING STATE
  const [isScreening, setIsScreening] = useState(false);
  const [stepperStep, setStepperStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  // RESULTS DATA
  const [screeningResult, setScreeningResult] = useState(null);
  const [starredCandidates, setStarredCandidates] = useState(() => new Set());
  const [showSkipped, setShowSkipped] = useState(false);
  const [showJdReqs, setShowJdReqs] = useState(false);

  // CLIENT-SIDE FILTERS
  const [filters, setFilters] = useState(DEFAULT_RECRUITER_FILTERS);

  // Stepper simulation timer while screening
  useEffect(() => {
    if (!isScreening) return;
    const timer1 = setTimeout(() => setStepperStep(2), 600);
    const timer2 = setTimeout(() => setStepperStep(3), 1200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isScreening]);

  // Compute number of pasted candidates (by splitting on regex r"\n\s*-{3,}\s*\n")
  const pastedCandidateCount = useMemo(() => {
    if (!pastedText || !pastedText.trim()) return 0;
    return pastedText.split(/\n\s*-{3,}\s*\n/).filter((part) => part.trim().length > 0).length;
  }, [pastedText]);

  const totalCandidateInputs = files.length + pastedCandidateCount;
  const isJdValid = jd.trim().length >= 40 && jd.trim().length <= 10000;
  const canScreen = isJdValid && totalCandidateInputs > 0 && !isScreening;

  // Handle Load Demo Data
  const handleLoadDemoData = () => {
    setJd(DEMO_JD);
    setPastedText(DEMO_PASTED_RESUMES);
    setFiles([]);
    setErrorMessage('');
  };

  // Handle Screen Candidates submission
  const handleScreen = async (e) => {
    if (e) e.preventDefault();
    if (!canScreen) return;

    setIsScreening(true);
    setStepperStep(1);
    setErrorMessage('');

    try {
      const result = await screenCandidates({
        jd,
        pasted: pastedText || undefined,
        files: files.length > 0 ? files : [],
      });

      setScreeningResult(result);
      setViewMode('results');
      setFilters(DEFAULT_RECRUITER_FILTERS); // Reset filters on new screening
      setStarredCandidates(new Set());
    } catch (err) {
      setErrorMessage(err.message || 'Screening request failed. Please check inputs or server connection.');
    } finally {
      setIsScreening(false);
    }
  };

  // Toggle Shortlist star
  const handleToggleStar = (name) => {
    setStarredCandidates((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  // Filtered candidate list (instant client-side)
  const candidatesList = screeningResult?.candidates;
  const allCandidates = useMemo(() => candidatesList || [], [candidatesList]);
  const visibleCandidates = useMemo(() => {
    return filterCandidates(allCandidates, filters);
  }, [allCandidates, filters]);

  // Export Shortlist CSV (pure client-side)
  const handleExportCsv = () => {
    const starredList = allCandidates.filter((c) => starredCandidates.has(c.name));
    if (starredList.length === 0) return;

    const csvContent = generateShortlistCsv(starredList);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SkillBridge_Shortlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* =========================================
          VIEW MODE 1: SETUP SCREEN
         ========================================= */}
      {viewMode === 'setup' && (
        <div className="space-y-6">
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink bg-cream px-2.5 py-0.5 rounded-md border border-amber/50">
                  Recruiter Assisted Screening
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                Semantic Candidate Matcher
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-2xl leading-relaxed">
                Rank resumes on true meaning and backed evidence, never on keyword counting or auto-rejection.
              </p>
            </div>

            {/* Quick Demo Button */}
            <div>
              <button
                type="button"
                onClick={handleLoadDemoData}
                disabled={isScreening}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-cream hover:bg-amber/40 text-ink border border-surface-border transition-colors shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-amber"
              >
                <Sparkles className="w-4 h-4 text-ink" />
                <span>Load demo data</span>
              </button>
            </div>
          </div>

          {/* Stepper Loading State */}
          {isScreening && (
            <div className="py-12">
              <ScreeningStatus currentStep={stepperStep} />
            </div>
          )}

          {/* Main Setup Form */}
          {!isScreening && (
            <form onSubmit={handleScreen} className="space-y-6">
              {/* Error message */}
              {errorMessage && (
                <ErrorAlert message={errorMessage} onRetry={handleScreen} />
              )}

              {/* Two-Column Setup Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Left: Job Description Card */}
                <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-soft flex flex-col justify-between">
                  <JdInput
                    value={jd}
                    onChange={setJd}
                    disabled={isScreening}
                  />
                </div>

                {/* Right: Resumes Uploader Card */}
                <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-soft flex flex-col justify-between">
                  <ResumeUploader
                    files={files}
                    onFilesChange={setFiles}
                    pastedText={pastedText}
                    onPastedTextChange={setPastedText}
                    pastedCandidateCount={pastedCandidateCount}
                    disabled={isScreening}
                  />
                </div>
              </div>

              {/* Privacy and Submit Action Bar */}
              <div className="p-6 rounded-2xl bg-surface border border-surface-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-ink-muted">
                  <Shield className="w-4 h-4 text-amber flex-shrink-0" />
                  <span>Resumes are processed in memory and not stored.</span>
                </div>

                <button
                  type="submit"
                  disabled={!canScreen}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-soft ${
                    !canScreen
                      ? 'bg-amber/40 text-ink/40 cursor-not-allowed shadow-none'
                      : 'bg-amber hover:bg-amber/90 active:scale-[0.99] text-ink focus:ring-2 focus:ring-amber focus:ring-offset-2'
                  }`}
                >
                  <Users className="w-4 h-4 text-ink" />
                  <span>
                    Screen candidates ({totalCandidateInputs} selected)
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* =========================================
          VIEW MODE 2: RESULTS SCREEN
         ========================================= */}
      {viewMode === 'results' && screeningResult && (
        <div className="space-y-6">
          {/* Top Return & Export Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setViewMode('setup')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-ink bg-surface hover:bg-cream border border-surface-border transition-colors shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-amber self-start"
            >
              <ArrowLeft className="w-4 h-4 text-ink" />
              <span>Edit inputs / New screening</span>
            </button>

            {starredCandidates.size > 0 && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber hover:bg-amber/90 text-ink border border-amber/70 shadow-soft transition-all focus:outline-none focus:ring-2 focus:ring-amber self-start sm:self-auto"
              >
                <Download className="w-4 h-4 text-ink" />
                <span>
                  Export shortlist ({starredCandidates.size})
                </span>
              </button>
            )}
          </div>

          {/* Summary Strip */}
          <div className="bg-surface rounded-2xl border border-surface-border p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cream border border-amber/50 flex items-center justify-center shadow-soft-sm">
                  <FileCheck2 className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-ink tracking-tight">
                    {screeningResult.screened} resumes screened
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Ranked by semantic match against your job requirements.
                  </p>
                </div>
              </div>

              {/* Skipped files expandable indicator */}
              {screeningResult.skipped && screeningResult.skipped.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSkipped(!showSkipped)}
                  aria-expanded={showSkipped}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange/15 text-ink border border-orange/40 hover:bg-orange/25 transition-colors focus:ring-2 focus:ring-amber focus:outline-none"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-orange" />
                  <span>{screeningResult.skipped.length} files skipped</span>
                  {showSkipped ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>

            {/* Skipped files details dropdown */}
            {showSkipped && screeningResult.skipped && (
              <div className="p-4 rounded-xl bg-orange/10 border border-orange/30 space-y-2 text-xs">
                <div className="font-bold text-ink">Skipped Files & Reasons:</div>
                <ul className="space-y-1.5 list-disc pl-4 text-ink-muted">
                  {screeningResult.skipped.map((skip, i) => (
                    <li key={i}>
                      <strong className="text-ink">{skip.name}</strong>: {skip.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Collapsible chips list: How we read your job description */}
            {screeningResult.jd_requirements && screeningResult.jd_requirements.length > 0 && (
              <div className="pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowJdReqs(!showJdReqs)}
                  aria-expanded={showJdReqs}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-amber-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber rounded"
                >
                  <span>How we read your job description ({screeningResult.jd_requirements.length} requirements)</span>
                  {showJdReqs ? <ChevronUp className="w-3.5 h-3.5 text-ink-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />}
                </button>

                {showJdReqs && (
                  <div className="mt-3 p-3.5 rounded-xl bg-surface-warm border border-surface-border space-y-2">
                    <p className="text-[11px] text-ink-muted">
                      Every candidate is evaluated against these extracted criteria lines:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-xs text-ink font-medium">
                      {screeningResult.jd_requirements.map((req, idx) => (
                        <li key={idx} className="leading-snug">
                          {req}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky Filter Bar */}
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            totalCount={allCandidates.length}
            visibleCount={visibleCandidates.length}
            onResetFilters={() => setFilters(DEFAULT_RECRUITER_FILTERS)}
          />

          {/* Empty filtered state */}
          {visibleCandidates.length === 0 && (
            <EmptyState
              title="No candidates match these filters"
              description="Adjust your minimum experience slider, clear skill constraints, or reset fit bands to reveal candidates."
              actionText="Show everyone"
              onAction={() => setFilters(DEFAULT_RECRUITER_FILTERS)}
            />
          )}

          {/* Candidate Cards in Rank Order */}
          {visibleCandidates.length > 0 && (
            <div className="space-y-4">
              {visibleCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.name}
                  candidate={candidate}
                  isStarred={starredCandidates.has(candidate.name)}
                  onToggleStar={handleToggleStar}
                  defaultExpandedWhy={candidate.rank <= 3}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
