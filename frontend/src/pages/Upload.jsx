import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload as UploadIcon,
  FileText,
  X,
  Sparkles,
  Briefcase,
  GraduationCap,
  Users,
  ChevronDown,
} from 'lucide-react';
import { analyzeResume } from '../api/client';
import { formatBytes } from '../lib/format';
import Spinner from '../components/Spinner';
import ErrorAlert from '../components/ErrorAlert';

const DEMO_PERSONAS = [
  {
    id: 'backend',
    label: 'Backend Developer (Python / Node / SQL)',
    text: `Senior Backend Engineer with 5+ years designing scalable microservices.
Core skills: Python, FastAPI, Django, Node.js, PostgreSQL, Redis, Docker, Git.
Architected distributed caching layers, reduced API latency by 35%, and deployed Kubernetes clusters on AWS.
Proficient in REST APIs, GraphQL, asynchronous event queues (RabbitMQ, Kafka), and CI/CD pipelines.
Solid understanding of system design, database indexing, Linux server maintenance, and automated testing with pytest.`,
  },
  {
    id: 'ml',
    label: 'Classic ML Engineer (Scikit-Learn / Pandas)',
    text: `Machine Learning Engineer specializing in tabular data modeling and predictive analytics.
Core skills: Python, Scikit-Learn, Pandas, NumPy, XGBoost, SQL, Docker, MLflow.
Trained and productionized customer churn and fraud detection models with 94% precision.
Experienced in data preprocessing pipelines, feature engineering, cross-validation, and REST model inference APIs.
Looking to advance capabilities into Large Language Models (LLMs), RAG pipelines, and vector databases.`,
  },
  {
    id: 'devops',
    label: 'DevOps & Platform Engineer (Terraform / K8s)',
    text: `DevOps Engineer focusing on Cloud Infrastructure reliability and continuous deployment automation.
Core skills: AWS, Terraform, Kubernetes, Docker, Helm, GitHub Actions, Linux, Prometheus, Grafana.
Maintained 99.99% uptime across production clusters, orchestrated multi-region failovers, and enforced IAM security policies.
Extensive experience with Bash scripting, infrastructure-as-code, and container security scanning.
Eager to pivot toward MLOps pipelines and scalable GPU inference cluster orchestration.`,
  },
];

export default function Upload() {
  const navigate = useNavigate();

  // Target audience selection
  const [selectedAudience, setSelectedAudience] = useState('pro');

  // Input state: file or text
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [showTextarea, setShowTextarea] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Submission & error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  // File validation
  const handleFileSelection = (selectedFile) => {
    setErrorMessage('');
    if (!selectedFile) return;

    // Check size <= 5 MB
    const maxSizeBytes = 5 * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setErrorMessage('The file exceeds the 5 MB limit. Please select a smaller PDF or DOCX file.');
      return;
    }

    // Check type (.pdf, .docx, .doc)
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const hasValidExt = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setErrorMessage('Please upload a valid PDF or DOCX document.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handlePersonaSelect = (e) => {
    const persona = DEMO_PERSONAS.find((p) => p.id === e.target.value);
    if (persona) {
      setText(persona.text);
      setShowTextarea(true);
      setFile(null); // Clear file when using demo persona
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !text.trim()) {
      setErrorMessage('Please upload your resume file or paste your resume text.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await analyzeResume({
        file: file || undefined,
        text: !file ? text.trim() : undefined,
      });

      // On success, navigate to /map with complete response in router state
      navigate('/map', {
        state: {
          analyzeData: response,
          uploadedFileMeta: file ? { name: file.name, size: file.size } : null,
        },
      });
    } catch (err) {
      setErrorMessage(err.message || 'Analysis failed. Please check the backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasInput = !!file || text.trim().length > 0;

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight mb-4">
          Stay irreplaceable in tech.
        </h1>
        <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
          Know your layoff risk, discover realistic next roles, and watch your personalized
          skill roadmap build itself card by card.
        </p>
      </div>

      {/* Audience selector cards */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {/* Working Professional - Active */}
        <button
          type="button"
          onClick={() => setSelectedAudience('pro')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedAudience === 'pro'
              ? 'bg-surface border-amber ring-2 ring-amber/70 shadow-soft'
              : 'bg-surface border-surface-border hover:border-amber/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-ink" aria-hidden="true" />
            </div>
            <span className="w-2 h-2 rounded-full bg-amber" />
          </div>
          <div className="font-bold text-sm text-ink">Working Professional</div>
          <div className="text-xs text-ink-muted mt-1 leading-snug">Assess pivot readiness & resilience</div>
        </button>

        {/* Learner - Disabled */}
        <div
          aria-disabled="true"
          className="p-4 rounded-2xl border border-surface-border bg-surface/50 opacity-60 cursor-not-allowed text-left relative"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-surface-border flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-ink-muted" aria-hidden="true" />
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-cream text-ink border border-surface-border">
              Coming soon
            </span>
          </div>
          <div className="font-semibold text-sm text-ink-muted">Learner & Student</div>
          <div className="text-xs text-ink-muted mt-1 leading-snug">Curated entry-level paths</div>
        </div>

        {/* Recruiter - Disabled */}
        <div
          aria-disabled="true"
          className="p-4 rounded-2xl border border-surface-border bg-surface/50 opacity-60 cursor-not-allowed text-left relative"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-surface-border flex items-center justify-center">
              <Users className="w-4 h-4 text-ink-muted" aria-hidden="true" />
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-cream text-ink border border-surface-border">
              Coming soon
            </span>
          </div>
          <div className="font-semibold text-sm text-ink-muted">Talent & Recruiter</div>
          <div className="text-xs text-ink-muted mt-1 leading-snug">Team skill-matrix analysis</div>
        </div>
      </div>

      {/* Main Upload Card */}
      <div className="w-full max-w-2xl bg-surface rounded-2xl border border-surface-border p-6 sm:p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header & Persona Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
            <div>
              <h2 className="text-base font-bold text-ink">Upload your resume</h2>
              <p className="text-xs text-ink-muted">PDF or DOCX format, up to 5 MB.</p>
            </div>

            {/* Try a demo resume dropdown */}
            <div className="relative">
              <select
                id="demo-resume-select"
                aria-label="Try a demo resume"
                defaultValue=""
                onChange={handlePersonaSelect}
                className="w-full sm:w-auto appearance-none bg-cream hover:bg-amber/30 text-ink text-xs font-semibold px-3 py-2 pr-8 rounded-xl border border-surface-border cursor-pointer transition-colors focus:ring-2 focus:ring-amber focus:outline-none"
              >
                <option value="" disabled>
                  Try a demo resume &hellip;
                </option>
                {DEMO_PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Drag & Drop Zone */}
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber bg-cream/30 scale-[0.99]'
                  : 'border-surface-border hover:border-amber/70 hover:bg-cream/10'
              }`}
              role="button"
              tabIndex={0}
              aria-label="Drag and drop your resume file here or click to browse"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-3 shadow-soft-sm">
                <UploadIcon className="w-5 h-5 text-ink" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-ink mb-1">
                Drag and drop your resume here, or <span className="underline decoration-amber underline-offset-2">browse</span>
              </p>
              <p className="text-xs text-ink-muted">PDF or DOCX (Max 5 MB)</p>
            </div>
          ) : (
            /* Selected File Card */
            <div className="flex items-center justify-between p-4 rounded-xl bg-cream/30 border border-amber/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-ink" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-ink truncate">{file.name}</p>
                  <p className="text-xs text-ink-muted">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove chosen file"
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-coral/20 transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quiet toggle to paste text */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowTextarea(!showTextarea)}
              className="text-xs text-ink-muted hover:text-ink font-medium underline underline-offset-4 decoration-surface-border transition-colors focus:outline-none"
            >
              {showTextarea ? 'Hide pasted resume text' : 'or paste your resume text instead'}
            </button>

            {showTextarea && (
              <div className="mt-3">
                <textarea
                  rows={6}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (e.target.value.trim() && file) {
                      setFile(null); // Prioritize text if user edits text
                    }
                  }}
                  placeholder="Paste work experience, skills, and accomplishments here..."
                  className="w-full p-3.5 text-sm rounded-xl border border-surface-border bg-surface-warm text-ink placeholder:text-ink-muted/60 focus:ring-2 focus:ring-amber focus:border-amber focus:outline-none resize-y"
                  aria-label="Pasted resume text content"
                />
              </div>
            )}
          </div>

          {/* Error Alert with retry */}
          {errorMessage && (
            <ErrorAlert
              message={errorMessage}
              onRetry={handleSubmit}
            />
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={!hasInput || isLoading}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-soft ${
              !hasInput || isLoading
                ? 'bg-amber/50 text-ink/50 cursor-not-allowed shadow-none'
                : 'bg-amber hover:bg-amber/90 active:scale-[0.99] text-ink focus:ring-2 focus:ring-amber focus:ring-offset-2'
            }`}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                <span>Analyzing your career path...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-ink" aria-hidden="true" />
                <span>Analyze my career</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
