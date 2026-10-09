import axios from 'axios';

/**
 * Flag determining whether to use client-side mock data or live FastAPI backend.
 * Default is true as required. Configurable via VITE_USE_MOCK in .env
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SESSION_STORAGE_KEY = 'sb_session';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Broadcast listener / callback for 401 session expiration
let unauthorizedHandler = null;

export function registerUnauthorizedHandler(callback) {
  unauthorizedHandler = callback;
}

// Request interceptor: attach Authorization header
api.interceptors.request.use(
  (config) => {
    try {
      const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        if (session?.token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${session.token}`;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // ignore
      }
      if (typeof unauthorizedHandler === 'function') {
        unauthorizedHandler();
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Normalizes Axios errors or API 4xx/5xx responses into a single friendly message string.
 * @param {Error} error
 * @returns {string}
 */
export function normalizeApiError(error) {
  if (error?.response?.data?.detail) {
    if (typeof error.response.data.detail === 'string') {
      return error.response.data.detail;
    }
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
    }
    return JSON.stringify(error.response.data.detail);
  }
  if (error?.response?.status === 401) {
    return 'Incorrect email or password.';
  }
  if (error?.response?.status === 409) {
    return 'An account with this email already exists.';
  }
  if (error?.response?.status === 413) {
    return 'The uploaded file exceeds the 5 MB limit. Please choose a smaller file.';
  }
  if (error?.response?.status === 422) {
    return 'Invalid request format. Please check your inputs.';
  }
  if (error?.response?.status === 502 || error?.response?.status === 503) {
    return 'Job search or upstream service is unavailable. Please try again.';
  }
  if (error?.code === 'ECONNABORTED') {
    return 'Connection timed out. The server took too long to respond.';
  }
  if (error?.message === 'Network Error' || !error?.response) {
    return 'Unable to connect to the backend server (http://localhost:8000). Ensure the FastAPI server is running or enable mock mode.';
  }
  return error?.message || 'An unexpected error occurred. Please try again.';
}

// Simulated network delay (~600ms)
const mockDelay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// MOCK DATA STORES FOR OFFLINE / MOCK MODE
// ==========================================

const MOCK_ANALYZE_RESPONSE = {
  skills: [
    'aws',
    'ci/cd',
    'docker',
    'git',
    'graphql',
    'javascript',
    'kubernetes',
    'linux',
    'microservices',
    'mongodb',
    'node.js',
    'postgresql',
    'python',
    'redis',
    'rest apis',
    'sql',
  ],
  current_role: {
    code: '15-1252.00',
    title: 'Software Developers',
  },
  risk_score: 62,
  risk_label: 'Medium',
  options: [
    {
      code: 'AI-0016.00',
      title: 'Full Stack AI Developer',
      label: 'step_up',
      score: 71,
      is_trending: true,
    },
    {
      code: '15-1251.00',
      title: 'MLOps & Platform Engineer',
      label: 'emerging',
      score: 65,
      is_trending: true,
    },
    {
      code: '15-1254.00',
      title: 'Cloud Solutions Architect',
      label: 'lateral',
      score: 82,
      is_trending: false,
    },
    {
      code: '15-1253.00',
      title: 'Site Reliability Engineer',
      label: 'lateral',
      score: 76,
      is_trending: false,
    },
  ],
};

const MOCK_ROADMAP_TEMPLATE = {
  role: {
    code: 'AI-0016.00',
    title: 'Full Stack AI Developer',
  },
  readiness: 71,
  steps: [
    {
      skill: 'Large Language Model Orchestration',
      order: 1,
      is_trending: true,
      topics: [
        {
          name: 'Prompt engineering patterns & few-shot reasoning',
          free: {
            title: 'DeepLearning.AI Prompt Engineering Course',
            url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/',
          },
          paid: {
            title: 'Coursera Generative AI with LLMs',
            url: 'https://www.coursera.org/learn/generative-ai-with-llms',
          },
          fallback: false,
        },
        {
          name: 'LangChain & LlamaIndex architecture',
          free: {
            title: 'Official LangChain Documentation & Cookbooks',
            url: 'https://python.langchain.com/docs/get_started/introduction',
          },
          paid: {
            title: 'Udemy Building LLM Apps with LangChain',
            url: 'https://www.udemy.com/topic/langchain/',
          },
          fallback: false,
        },
      ],
    },
    {
      skill: 'Vector Databases & Retrieval Augmented Generation',
      order: 2,
      is_trending: true,
      topics: [
        {
          name: 'Dense embeddings & cosine distance indexing',
          free: {
            title: 'Pinecone Vector Embeddings Learning Center',
            url: 'https://www.pinecone.io/learn/vector-embeddings/',
          },
          paid: {
            title: 'O’Reilly Production Vector Search Systems',
            url: 'https://www.oreilly.com/library/view/vector-search/9781098144036/',
          },
          fallback: false,
        },
        {
          name: 'Hybrid search with ChromaDB & pgvector',
          free: {
            title: 'pgvector Official Integration Guide',
            url: 'https://github.com/pgvector/pgvector',
          },
          paid: {
            title: 'Pragmatic AI: Advanced RAG Architecture',
            url: 'https://www.oreilly.com/',
          },
          fallback: true,
        },
      ],
    },
    {
      skill: 'PyTorch & Fine-Tuning Foundations',
      order: 3,
      is_trending: false,
      topics: [
        {
          name: 'LoRA and QLoRA parameter-efficient tuning',
          free: {
            title: 'Hugging Face PEFT Documentation',
            url: 'https://huggingface.co/docs/peft/index',
          },
          paid: {
            title: 'Fast.ai Practical Deep Learning for Coders',
            url: 'https://course.fast.ai/',
          },
          fallback: false,
        },
      ],
    },
    {
      skill: 'AI Evaluation & Observability',
      order: 4,
      is_trending: true,
      topics: [
        {
          name: 'Evaluating hallucinations with Ragas & TruLens',
          free: {
            title: 'Ragas Metrics & Evaluation Framework',
            url: 'https://docs.ragas.io/en/stable/',
          },
          paid: {
            title: 'Weights & Biases LLM Monitoring Certification',
            url: 'https://wandb.ai/site',
          },
          fallback: false,
        },
      ],
    },
    {
      skill: 'Async Inference & Streaming Protocols',
      order: 5,
      is_trending: false,
      topics: [
        {
          name: 'Server-Sent Events (SSE) & WebSocket token streaming',
          free: {
            title: 'MDN Web Docs: Server-Sent Events',
            url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events',
          },
          paid: {
            title: 'Frontend Masters: High Performance Node Networking',
            url: 'https://frontendmasters.com/',
          },
          fallback: false,
        },
      ],
    },
    {
      skill: 'Agentic Workflows & Tool Calling',
      order: 6,
      is_trending: true,
      topics: [
        {
          name: 'Multi-agent state machines with LangGraph',
          free: {
            title: 'LangGraph Conceptual Guides',
            url: 'https://langchain-ai.github.io/langgraph/',
          },
          paid: {
            title: 'DeepLearning.AI Multi AI Agent Systems',
            url: 'https://www.deeplearning.ai/short-courses/multi-ai-agent-systems-with-crewai/',
          },
          fallback: false,
        },
        {
          name: 'Structured outputs & JSON schema validation',
          free: {
            title: 'OpenAI Function Calling Guide',
            url: 'https://platform.openai.com/docs/guides/function-calling',
          },
          paid: {
            title: 'Enterprise AI Development Boot Camp',
            url: 'https://www.coursera.org/',
          },
          fallback: true,
        },
      ],
    },
    {
      skill: 'Secure Guardrails & Model Safety',
      order: 7,
      is_trending: false,
      topics: [
        {
          name: 'Input sanitizer & Prompt Injection prevention',
          free: {
            title: 'OWASP Top 10 for Large Language Models',
            url: 'https://genai.owasp.org/llm-top-10/',
          },
          paid: {
            title: 'SANS Institute AI Application Security',
            url: 'https://www.sans.org/',
          },
          fallback: false,
        },
      ],
    },
    {
      skill: 'Production Deployment & GPU Serving',
      order: 8,
      is_trending: true,
      topics: [
        {
          name: 'vLLM and TGI serving engine deployment',
          free: {
            title: 'vLLM Quickstart and High-throughput Benchmarking',
            url: 'https://docs.vllm.ai/en/latest/',
          },
          paid: {
            title: 'Cloud Academy Kubernetes GPU Cluster Deployment',
            url: 'https://cloudacademy.com/',
          },
          fallback: false,
        },
      ],
    },
  ],
};

// Seed in-memory mock roadmaps storage
let mockNextId = 101;
const mockRoadmapsDb = [
  {
    id: 1,
    role_code: 'AI-0016.00',
    role_title: 'Full Stack AI Developer',
    created_at: '2026-03-28 10:15:00',
    percent: 25,
    skills: ['aws', 'ci/cd', 'docker', 'git', 'javascript', 'linux', 'node.js', 'python', 'sql'],
    roadmap: JSON.parse(JSON.stringify(MOCK_ROADMAP_TEMPLATE)),
    progress: [
      {
        skill: 'Large Language Model Orchestration',
        topic: 'Prompt engineering patterns & few-shot reasoning',
        done: true,
        note: 'Completed first 3 assignments on chain-of-thought prompting.',
      },
      {
        skill: 'Large Language Model Orchestration',
        topic: 'LangChain & LlamaIndex architecture',
        done: true,
        note: 'Built prototype RAG bot with LCEL.',
      },
    ],
  },
];

// Helper to calculate percent for mock roadmap
function computeMockPercent(roadmap, progress) {
  const totalTopics = roadmap.steps.reduce((acc, step) => acc + step.topics.length, 0);
  if (totalTopics === 0) return 0;
  const doneTopics = progress.filter((p) => p.done).length;
  return Math.round((100 * doneTopics) / totalTopics);
}

// Ensure initial seed percent is accurate
mockRoadmapsDb[0].percent = computeMockPercent(mockRoadmapsDb[0].roadmap, mockRoadmapsDb[0].progress);

// Mock Jobs Pool
const MOCK_JOBS = [
  {
    title: 'Senior AI Application Engineer',
    company: 'Anthropic',
    location: 'San Francisco, CA (or Remote)',
    url: 'https://jobs.lever.co/anthropic',
    tiers: ['FAANG', 'Unicorn'],
    skill_match_pct: 88,
    missing_skills: ['Evaluation Frameworks'],
    needs_more: 1,
  },
  {
    title: 'Lead Generative AI Platform Architect',
    company: 'Microsoft Azure AI',
    location: 'Bengaluru / Redmond (Hybrid)',
    url: 'https://careers.microsoft.com',
    tiers: ['FAANG', 'Top MNC'],
    skill_match_pct: 92,
    missing_skills: [],
    needs_more: 0,
  },
  {
    title: 'Full Stack LLM Infrastructure Engineer',
    company: 'Perplexity AI',
    location: 'Remote',
    url: 'https://www.perplexity.ai/careers',
    tiers: ['Unicorn', 'Startup'],
    skill_match_pct: 75,
    missing_skills: ['vLLM', 'TGI Serving'],
    needs_more: 2,
  },
  {
    title: 'Senior MLOps & RAG Pipeline Engineer',
    company: 'Databricks',
    location: 'San Francisco, CA',
    url: 'https://databricks.com/company/careers',
    tiers: ['Unicorn', 'Top MNC'],
    skill_match_pct: 80,
    missing_skills: ['Vector DB Indexing'],
    needs_more: 1,
  },
  {
    title: 'Staff AI Systems Developer',
    company: 'National Informatics Centre',
    location: 'New Delhi, India',
    url: 'https://www.nic.in',
    tiers: ['Government'],
    skill_match_pct: 70,
    missing_skills: ['Model Safety Guardrails', 'LangGraph'],
    needs_more: 2,
  },
  {
    title: 'AI Product Engineer',
    company: 'Scale AI',
    location: 'San Francisco, CA',
    url: 'https://scale.com/careers',
    tiers: ['Unicorn'],
    skill_match_pct: 85,
    missing_skills: ['PyTorch LoRA'],
    needs_more: 1,
  },
  {
    title: 'Founding AI Full Stack Engineer',
    company: 'Cognition AI',
    location: 'Remote',
    url: 'https://cognition.ai/careers',
    tiers: ['Startup'],
    skill_match_pct: 65,
    missing_skills: ['Multi-agent orchestration', 'vLLM', 'GPU Serving'],
    needs_more: 3,
  },
  {
    title: 'Cloud & AI Solutions Architect',
    company: 'Tata Consultancy Services',
    location: 'Hyderabad, India',
    url: 'https://www.tcs.com/careers',
    tiers: ['Top MNC', 'Other'],
    skill_match_pct: 82,
    missing_skills: ['Observability'],
    needs_more: 1,
  },
  {
    title: 'Applied AI Software Engineer',
    company: 'Google DeepMind',
    location: 'London, UK / Mountain View, CA',
    url: 'https://deepmind.google/about/careers/',
    tiers: ['FAANG'],
    skill_match_pct: 95,
    missing_skills: [],
    needs_more: 0,
  },
];

// Mock News Pool
const MOCK_NEWS_ITEMS = [
  {
    title: 'OpenAI Unveils Autonomous Coding Orchestration Architecture',
    link: 'https://techcrunch.com/artificial-intelligence',
    source: 'TechCrunch',
    published: Math.floor(Date.now() / 1000) - 3600 * 2, // 2h ago
    category: 'launch',
    summary: 'The new release allows continuous reasoning loops, tool inspection, and dynamic agent delegation with verified unit test suites.',
  },
  {
    title: 'Anthropic Raises $4B Series E as Enterprise Agent Adoption Surges',
    link: 'https://techcrunch.com/venture',
    source: 'TechCrunch',
    published: Math.floor(Date.now() / 1000) - 3600 * 5, // 5h ago
    category: 'funding',
    summary: 'Funding will accelerate frontier model training, dedicated GPU clusters, and safety evaluations across global enterprise cloud partners.',
  },
  {
    title: 'Tech Layoffs Steady in Q1 2026 as Hiring Pivots Exclusively to AI Specialists',
    link: 'https://news.google.com/search?q=tech+layoffs',
    source: 'Bloomberg Technology',
    published: Math.floor(Date.now() / 1000) - 3600 * 9, // 9h ago
    category: 'layoff',
    summary: 'Traditional software development headcounts contract as companies reallocate budgets to hire engineers fluent in RAG and agent orchestration.',
  },
  {
    title: 'Perplexity Hits $9B Valuation in New Round Led by Institutional Backers',
    link: 'https://inc42.com/startups',
    source: 'Inc42',
    published: Math.floor(Date.now() / 1000) - 3600 * 14, // 14h ago
    category: 'unicorn',
    summary: 'The AI search engine scales up conversational enterprise capabilities and real-time knowledge synthesis infrastructure.',
  },
  {
    title: 'Top AI Engineering Compensation Packages Cross $450k in Metro Hubs',
    link: 'https://news.google.com/search?q=software+engineer+salary',
    source: 'Levels.fyi Market Report',
    published: Math.floor(Date.now() / 1000) - 3600 * 22, // 22h ago
    category: 'package',
    summary: 'Specialists combining backend systems architecture with fine-tuning and inference optimizations command significant market premiums.',
  },
  {
    title: 'Cloudflare and NVIDIA Partner on Distributed Low-Latency Edge Inference',
    link: 'https://techcrunch.com/enterprise',
    source: 'TechCrunch',
    published: Math.floor(Date.now() / 1000) - 3600 * 28, // 1d ago
    category: 'launch',
    summary: 'Developers can now deploy serverless agent workers directly adjacent to end-users without dedicated hardware provisioning.',
  },
  {
    title: 'Global Tech Leaders Open 5,000+ AI Platform Positions in Bangalore & Hyderabad',
    link: 'https://news.google.com/search?q=hiring',
    source: 'Economic Times',
    published: Math.floor(Date.now() / 1000) - 3600 * 34, // 1d ago
    category: 'hiring',
    summary: 'Global Capability Centers (GCCs) accelerate campus and lateral hiring for LLM reliability and MLOps platforms.',
  },
  {
    title: 'Open-Weight Model Breakthrough: High-Speed Small Models Rival Frontier Benchmarks',
    link: 'https://news.google.com/search?q=open+source+ai',
    source: 'Hugging Face Blog',
    published: Math.floor(Date.now() / 1000) - 3600 * 48, // 2d ago
    category: 'other',
    summary: 'Distillation techniques enable 7B-parameter models to deliver state-of-the-art coding benchmark results on commodity hardware.',
  },
];

// ==========================================
// 1. AUTH API METHODS
// ==========================================

/**
 * POST /auth/signup
 * Body: { email, password }
 * Response: { token, email }
 */
export async function signup({ email, password }) {
  if (USE_MOCK) {
    await mockDelay(600);
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Enter a valid email address.');
    }
    if (!password || password.length < 6 || password.length > 72) {
      throw new Error('Password must be between 6 and 72 characters.');
    }
    const token = `mock-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return { token, email: cleanEmail };
  }

  try {
    const response = await api.post('/auth/signup', {
      email: (email || '').trim().toLowerCase(),
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

/**
 * POST /auth/login
 * Body: { email, password }
 * Response: { token, email }
 */
export async function login({ email, password }) {
  if (USE_MOCK) {
    await mockDelay(600);
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Incorrect email or password.');
    }
    const token = `mock-token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return { token, email: cleanEmail };
  }

  try {
    const response = await api.post('/auth/login', {
      email: (email || '').trim().toLowerCase(),
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

// ==========================================
// 2. RESUME & ROADMAP GENERATION (FREE FLOW)
// ==========================================

export async function analyzeResume({ file, text }) {
  if (USE_MOCK) {
    await mockDelay(650);
    if (text && text.toLowerCase().includes('devops')) {
      return {
        ...MOCK_ANALYZE_RESPONSE,
        current_role: { code: '15-1253.00', title: 'DevOps & Infrastructure Engineer' },
        risk_score: 42,
        risk_label: 'Low',
        options: [
          { code: '15-1251.00', title: 'MLOps & Platform Engineer', label: 'step_up', score: 80, is_trending: true },
          { code: 'AI-0016.00', title: 'Full Stack AI Developer', label: 'emerging', score: 62, is_trending: true },
          { code: '15-1254.00', title: 'Cloud Solutions Architect', label: 'lateral', score: 88, is_trending: false },
        ],
      };
    }
    if (text && text.toLowerCase().includes('machine learning')) {
      return {
        ...MOCK_ANALYZE_RESPONSE,
        current_role: { code: '15-2051.00', title: 'Data Scientist / Classic ML Engineer' },
        risk_score: 55,
        risk_label: 'Medium',
        options: [
          { code: 'AI-0016.00', title: 'Full Stack AI Developer', label: 'step_up', score: 75, is_trending: true },
          { code: 'AI-0020.00', title: 'Research Engineer (LLMs)', label: 'emerging', score: 68, is_trending: true },
          { code: '15-1251.00', title: 'MLOps & Platform Engineer', label: 'lateral', score: 78, is_trending: false },
        ],
      };
    }
    return MOCK_ANALYZE_RESPONSE;
  }

  try {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else if (text) {
      formData.append('text', text);
    } else {
      throw new Error('Please provide either a resume file or resume text.');
    }

    const response = await api.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

export async function getRoadmap({ role_code, skills }) {
  if (USE_MOCK) {
    await mockDelay(650);
    return MOCK_ROADMAP_TEMPLATE;
  }

  try {
    const response = await api.post('/roadmap', {
      role_code,
      skills: Array.isArray(skills) ? skills : [],
    });

    return response.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

// ==========================================
// 3. AUTHENTICATED ROADMAP TRACKING (/me)
// ==========================================

/**
 * POST /me/roadmaps
 * Body: { role_code, skills }
 * Response: { id }
 */
export async function saveUserRoadmap({ role_code, skills }) {
  if (USE_MOCK) {
    await mockDelay(600);
    // Check if duplicate already exists
    const existing = mockRoadmapsDb.find((r) => r.role_code === role_code);
    if (existing) {
      return { id: existing.id, isExisting: true };
    }

    const newId = ++mockNextId;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newRoadmapEntry = {
      id: newId,
      role_code,
      role_title: MOCK_ROADMAP_TEMPLATE.role.title,
      created_at: now,
      percent: 0,
      skills: Array.isArray(skills) ? skills : [],
      roadmap: JSON.parse(JSON.stringify(MOCK_ROADMAP_TEMPLATE)),
      progress: [],
    };
    mockRoadmapsDb.unshift(newRoadmapEntry);
    return { id: newId, isExisting: false };
  }

  try {
    const response = await api.post('/me/roadmaps', {
      role_code,
      skills: Array.isArray(skills) ? skills : [],
    });
    return response.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

/**
 * GET /me/roadmaps
 * Response: { roadmaps: [{ id, role_code, role_title, created_at, percent }] }
 */
export async function listUserRoadmaps() {
  if (USE_MOCK) {
    await mockDelay(600);
    const roadmaps = mockRoadmapsDb.map((r) => ({
      id: r.id,
      role_code: r.role_code,
      role_title: r.role_title,
      created_at: r.created_at,
      percent: r.percent,
    }));
    return { roadmaps };
  }

  try {
    const response = await api.get('/me/roadmaps');
    return response.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

/**
 * GET /me/roadmaps/{id}
 * Response: { id, roadmap, progress, percent, skills }
 */
export async function getUserRoadmap(id) {
  if (USE_MOCK) {
    await mockDelay(600);
    const item = mockRoadmapsDb.find((r) => r.id === Number(id));
    if (!item) {
      throw new Error('Roadmap not found.');
    }
    return {
      id: item.id,
      roadmap: item.roadmap,
      progress: item.progress,
      percent: item.percent,
      skills: item.skills,
    };
  }

  try {
    const response = await api.get(`/me/roadmaps/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

/**
 * PUT /me/roadmaps/{id}/topic
 * Body: { skill, topic, done?, note? }
 * Response: { done, note, percent }
 */
export async function updateUserTopicProgress(id, { skill, topic, done, note }) {
  if (USE_MOCK) {
    await mockDelay(350);
    const roadmapItem = mockRoadmapsDb.find((r) => r.id === Number(id));
    if (!roadmapItem) {
      throw new Error('Roadmap not found.');
    }

    let progressEntry = roadmapItem.progress.find((p) => p.skill === skill && p.topic === topic);
    if (!progressEntry) {
      progressEntry = { skill, topic, done: false, note: '' };
      roadmapItem.progress.push(progressEntry);
    }

    if (done !== undefined) {
      progressEntry.done = Boolean(done);
    }
    if (note !== undefined) {
      progressEntry.note = String(note).slice(0, 2000);
    }

    roadmapItem.percent = computeMockPercent(roadmapItem.roadmap, roadmapItem.progress);

    return {
      done: progressEntry.done,
      note: progressEntry.note,
      percent: roadmapItem.percent,
    };
  }

  try {
    const body = { skill, topic };
    if (done !== undefined) body.done = done;
    if (note !== undefined) body.note = note;

    const response = await api.put(`/me/roadmaps/${id}/topic`, body);
    return response.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

// ==========================================
// 4. JOBS API
// ==========================================

/**
 * POST /jobs
 * Body: { role_code, skills, location, remote, tier }
 * Response: { role: {code, title}, count, jobs: [...] }
 */
export async function searchJobs({ role_code, skills, location = '', remote = false, tier = null }) {
  if (USE_MOCK) {
    await mockDelay(600);
    const userSkillsSet = new Set((skills || []).map((s) => s.toLowerCase()));

    // Filter by tier if specified
    let filtered = MOCK_JOBS.filter((j) => {
      if (!tier || tier === 'All') return true;
      return j.tiers.includes(tier);
    });

    // Filter by remote if specified
    if (remote) {
      filtered = filtered.filter((j) => j.location.toLowerCase().includes('remote'));
    }

    // Filter by location if specified
    if (location && location.trim()) {
      const locLower = location.trim().toLowerCase();
      filtered = filtered.filter((j) => j.location.toLowerCase().includes(locLower));
    }

    // Recalculate dynamic missing / needs_more based on user's active skills
    const mapped = filtered.map((job) => {
      // Mock skill match percentage based on user's current skill breadth
      const matchPct = job.skill_match_pct;
      return {
        ...job,
        skill_match_pct: matchPct,
      };
    });

    return {
      role: {
        code: role_code || 'AI-0016.00',
        title: 'Full Stack AI Developer',
      },
      count: mapped.length,
      jobs: mapped,
    };
  }

  try {
    const response = await api.post('/jobs', {
      role_code,
      skills: Array.isArray(skills) ? skills : [],
      location: location || '',
      remote: Boolean(remote),
      tier: tier === 'All' ? null : tier,
    });
    return response.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

// ==========================================
// 5. TECH MARKET NEWS API
// ==========================================

/**
 * GET /news?category=&limit=
 * Response: { categories: string[], count: number, items: [...] }
 */
export async function getMarketNews({ category = null, limit = 30 } = {}) {
  if (USE_MOCK) {
    await mockDelay(700);
    const categories = ['layoff', 'funding', 'unicorn', 'package', 'launch', 'hiring', 'other'];
    let items = MOCK_NEWS_ITEMS;
    if (category && category !== 'all') {
      items = items.filter((item) => item.category === category.toLowerCase());
    }
    return {
      categories,
      count: items.length,
      items: items.slice(0, limit),
    };
  }

  try {
    const params = { limit };
    if (category && category !== 'all') {
      params.category = category;
    }
    const response = await api.get('/news', { params });
    return response.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

// ==========================================
// 6. QUIZ API
// ==========================================

// In-memory mock quiz store for offline / mock testing: quiz_id -> { answers, meta, questions, ts }
const mockQuizzesDb = {};

/**
 * Realistic Mock Question Bank tailored to SkillBridge roadmap skills & topics
 */
const MOCK_QUESTION_BANK = {
  'Large Language Model Orchestration': {
    easy: [
      {
        topic: 'Prompt engineering patterns & few-shot reasoning',
        question: 'What is the primary benefit of "Few-Shot Prompting" compared to zero-shot prompting?',
        options: [
          'It provides exemplar input-output demonstrations to guide model formatting and reasoning style.',
          'It fine-tunes model weights permanently across transformer attention heads.',
          'It compresses prompt token count using lossy semantic embedding pruning.',
          'It disables stochastic sampling to force zero-entropy generation.',
        ],
        correct: 0,
        explanation: 'Few-shot prompting provides concrete exemplars directly in the context window, guiding the model on formatting, edge cases, and reasoning patterns without retraining.',
      },
      {
        topic: 'Prompt engineering patterns & few-shot reasoning',
        question: 'What technique explicitly prompts the model to "think step by step" before returning a final answer?',
        options: [
          'Chain-of-Thought (CoT) prompting',
          'Recurrent state checkpointing',
          'Beam search quantization',
          'Soft prefix tuning',
        ],
        correct: 0,
        explanation: 'Chain-of-Thought prompting directs LLMs to generate intermediate rationales before delivering the conclusion, significantly improving multi-step reasoning accuracy.',
      },
      {
        topic: 'LangChain & LlamaIndex architecture',
        question: 'In modern LangChain, what abstraction standardizes chain composability using unix-like pipe syntax (|)?',
        options: [
          'LangChain Expression Language (LCEL)',
          'AgentExecutor Protocol',
          'ConversationBufferMemory',
          'Hub Pipeline Decorator',
        ],
        correct: 0,
        explanation: 'LCEL (LangChain Expression Language) is the declarative standard that enables streaming, batching, async execution, and pipe composition across components.',
      },
      {
        topic: 'LangChain & LlamaIndex architecture',
        question: 'What is the primary architectural responsibility of an Index in LlamaIndex?',
        options: [
          'Structuring unstructured documents into queryable data representations for retrieval',
          'Serving model weights onto GPU tensor cores via vLLM',
          'Formatting HTTP/2 SSE chunks into WebSocket frames',
          'Managing user authentication sessions and JWT decoding',
        ],
        correct: 0,
        explanation: 'In LlamaIndex, Indices structure document nodes and chunks into queryable data structures (like vector stores, summary trees, or keyword tables) for downstream synthesis.',
      },
      {
        topic: 'Prompt engineering patterns & few-shot reasoning',
        question: 'What role does a "System Prompt" play in chat-completion APIs?',
        options: [
          'It sets top-level persona, behavioral constraints, and instructions for the entire dialogue.',
          'It compiles Python code into intermediate bytecode before calling OpenAI.',
          'It caches embeddings in Redis to prevent model billing charges.',
          'It replaces tokenizer dictionaries with custom vocabulary tables.',
        ],
        correct: 0,
        explanation: 'System prompts establish the overarching rules, safety boundaries, persona, and output schemas that govern subsequent user and assistant interactions.',
      },
    ],
    medium: [
      {
        topic: 'Prompt engineering patterns & few-shot reasoning',
        question: 'When implementing ReAct (Reasoning + Acting) agent loops, how does the model determine when to halt execution?',
        options: [
          'By outputting a designated Final Answer token after parsing observation results',
          'By exceeding the GPU VRAM allocation limit',
          'By receiving an HTTP 204 No Content response from the tool webhook',
          'When the user sends a SIGTERM interrupt signal',
        ],
        correct: 0,
        explanation: 'In the ReAct pattern, the model cycles through Thought, Action, and Observation until it determines sufficient information has been gathered to produce a Final Answer.',
      },
      {
        topic: 'LangChain & LlamaIndex architecture',
        question: 'How does LangGraph differ fundamentally from legacy sequential LangChain AgentExecutors?',
        options: [
          'It models workflows as cyclical state graphs with explicit state management and human-in-the-loop branching.',
          'It only supports synchronous execution on local CPU machines.',
          'It does not support external tool calling or structured output schemas.',
          'It requires compiling Python models into WebAssembly runtimes.',
        ],
        correct: 0,
        explanation: 'LangGraph models multi-step agentic systems as cyclic state machines, allowing loops, complex conditional routing, time-travel debugging, and persistence.',
      },
      {
        topic: 'LangChain & LlamaIndex architecture',
        question: 'When chunking markdown documents for RAG, why is RecursiveCharacterTextSplitter preferred over naive character splitting?',
        options: [
          'It respects paragraph, header, and sentence boundaries before falling back to character counts, keeping semantic context intact.',
          'It compresses text by 50% using gzip compression algorithms.',
          'It encrypts chunks with AES-256 before writing to disk.',
          'It converts markdown tables into binary parquet files automatically.',
        ],
        correct: 0,
        explanation: 'RecursiveCharacterTextSplitter splits text using a hierarchy of separators (double newlines, single newlines, spaces) to preserve semantic coherence within chunks.',
      },
      {
        topic: 'Prompt engineering patterns & few-shot reasoning',
        question: 'To enforce deterministic JSON schema output from modern frontier LLMs, which API parameter is most effective?',
        options: [
          'Structured Outputs (`response_format` with strict JSON schema)',
          'Setting temperature to 2.0 with high top_k',
          'Injecting "Please output valid JSON" into the user prompt only',
          'Increasing frequency_penalty to maximum value',
        ],
        correct: 0,
        explanation: 'Constrained decoding via Structured Outputs guarantees 100% adherence to supplied Pydantic or JSON schemas at the tokenizer grammar level.',
      },
      {
        topic: 'LangChain & LlamaIndex architecture',
        question: 'What is the purpose of an Asynchronous Document Ingestion pipeline in production RAG systems?',
        options: [
          'Processing large volumes of documents without blocking the main query serving thread',
          'Running GPU matrix multiplications directly inside browser workers',
          'Replacing vector embeddings with simple regex string searches',
          'Synchronizing local git repositories with cloud storage buckets',
        ],
        correct: 0,
        explanation: 'Async ingestion decouples parsing, chunking, and embedding generation from low-latency query handling, enabling high-throughput indexing.',
      },
    ],
    hard: [
      {
        topic: 'Prompt engineering patterns & few-shot reasoning',
        question: 'Under "Lost in the Middle" phenomena in long-context LLMs, how does context placement affect retrieval accuracy?',
        options: [
          'Information placed in the middle of long prompts has significantly lower recall than data placed at the very start or end.',
          'Models exclusively read the exact middle 25% of tokens due to rotary position embeddings.',
          'Attention weights degrade uniformly across all token positions without positional bias.',
          'Context length is strictly capped at 2,048 tokens regardless of claimed window sizes.',
        ],
        correct: 0,
        explanation: 'Extensive empirical research reveals that decoder transformers exhibit a U-shaped recall curve, frequently missing facts located in the central third of large context windows.',
      },
      {
        topic: 'LangChain & LlamaIndex architecture',
        question: 'When designing multi-agent orchestration with shared state across parallel sub-agents, how do you prevent race conditions in state updates?',
        options: [
          'Use reducer functions (e.g. Annotated[list, operator.add] in LangGraph) to atomically append or merge partial state updates.',
          'Disable multi-threading and run all sub-agents sequentially on a single thread.',
          'Force all agents to communicate exclusively through disk-persisted SQLite lockfiles.',
          'Clear the entire conversational memory between sub-agent delegations.',
        ],
        correct: 0,
        explanation: 'State graphs use explicit reducer functions on channel fields to deterministically combine parallel outputs without destructive overwrites.',
      },
      {
        topic: 'Prompt engineering patterns & few-shot reasoning',
        question: 'In self-consistency decoding with Chain-of-Thought, what aggregation strategy determines the final answer?',
        options: [
          'Sampling multiple reasoning paths at temperature > 0 and taking the majority vote of the final answers',
          'Averaging the logits of all generated intermediate tokens across runs',
          'Selecting the reasoning path with the lowest overall character length',
          'Concatenating all generated paths into a single recursive follow-up prompt',
        ],
        correct: 0,
        explanation: 'Self-consistency samples diverse reasoning paths and selects the answer that achieved majority consensus, significantly boosting complex problem solving accuracy.',
      },
      {
        topic: 'LangChain & LlamaIndex architecture',
        question: 'When implementing speculative decoding in custom serving pipelines, what role does a smaller draft model play?',
        options: [
          'It generates candidate token sequences rapidly, which the larger target model verifies in parallel in a single forward pass.',
          'It translates prompt strings into foreign languages before passing to the target model.',
          'It quantizes the target model weights from FP16 to INT4 dynamically during inference.',
          'It acts as an external vector database for prompt embeddings.',
        ],
        correct: 0,
        explanation: 'Speculative decoding utilizes a lightweight model to draft tokens quickly, allowing the large model to validate multiple tokens simultaneously, achieving 2-3x latency speedups.',
      },
      {
        topic: 'Prompt engineering patterns & few-shot reasoning',
        question: 'Which vulnerability occurs when user input manipulates an LLM into ignoring prior system constraints and executing unauthorized instructions?',
        options: [
          'Direct Prompt Injection (Jailbreak)',
          'Cross-Site Scripting (XSS) via HTML tags',
          'SQL Injection via unescaped string literals',
          'Buffer Overflow in CUDA memory buffers',
        ],
        correct: 0,
        explanation: 'Direct Prompt Injection overrides system instructions by feeding deceptive user text that instructs the LLM to discard original rules or leak hidden context.',
      },
    ],
  },
};

/**
 * Fallback questions generator for skills not in the static bank
 */
function generateFallbackQuestions(skill, topics, level) {
  const diffLabel = level === 'hard' ? 'debugging & trade-offs' : level === 'medium' ? 'practical application' : 'core fundamentals';
  const questions = [];

  for (let i = 0; i < 5; i++) {
    const topic = topics[i % topics.length] || skill;
    questions.push({
      id: i,
      topic,
      question: `Regarding ${topic} (${diffLabel}): What is the primary engineering consideration when scaling ${skill}?`,
      options: [
        `Ensuring deterministic state consistency, robust error boundaries, and telemetry for ${topic}.`,
        `Completely eliminating caching layers to force compute-intensive recalculation on every request.`,
        `Relying on unvalidated input parameters without type assertions or sanitization filters.`,
        `Hardcoding configuration tokens directly into clientside frontend assets.`,
      ],
      correct: 0,
      explanation: `Proper production implementations of ${topic} prioritize deterministic error handling, validated contracts, and continuous observability over ad-hoc solutions.`,
    });
  }

  return questions;
}

/**
 * 1) POST /quiz
 * Body: { roadmap_id: number, skill: string, level: "easy" | "medium" | "hard" }
 * Response: { quiz_id: string, skill: string, level: string, questions: [{ id, topic, question, options }] }
 */
export async function startQuiz({ roadmap_id, skill, level = 'easy' }) {
  if (USE_MOCK) {
    await mockDelay(800);
    // Find roadmap to ensure skill validity
    const roadmapItem = mockRoadmapsDb.find((r) => r.id === Number(roadmap_id));
    const step = roadmapItem?.roadmap?.steps?.find((s) => s.skill === skill);
    const topics = step ? step.topics.map((t) => t.name) : [skill];

    let pool = MOCK_QUESTION_BANK[skill]?.[level];
    if (!pool || pool.length === 0) {
      pool = generateFallbackQuestions(skill, topics, level);
    }

    // Shuffle options so answer index isn't static
    const questions = [];
    const answers = [];

    pool.forEach((item, idx) => {
      const correctText = item.options[item.correct];
      const shuffledOptions = [...item.options].sort(() => Math.random() - 0.5);
      const newCorrectIndex = shuffledOptions.indexOf(correctText);

      questions.push({
        id: idx,
        topic: item.topic,
        question: item.question,
        options: shuffledOptions,
      });

      answers.push({
        correct: newCorrectIndex,
        topic: item.topic,
        explanation: item.explanation,
      });
    });

    const quiz_id = `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    mockQuizzesDb[quiz_id] = {
      answers,
      meta: { skill, level, roadmap_id },
      questions,
      ts: Date.now(),
    };

    return {
      quiz_id,
      skill,
      level,
      questions,
    };
  }

  try {
    const response = await api.post('/quiz', {
      roadmap_id: Number(roadmap_id),
      skill,
      level,
    });
    return response.data;
  } catch (error) {
    throw new Error(normalizeApiError(error));
  }
}

/**
 * 2) POST /quiz/{quiz_id}/submit
 * Body: { answers: { "0": 2, "1": 0 } }
 * Response: { score, total, percent, level, skill, strong_topics, weak_topics, summary, review }
 */
export async function submitQuiz(quiz_id, answersMap = {}) {
  if (USE_MOCK) {
    await mockDelay(800);
    const quiz = mockQuizzesDb[quiz_id];
    if (!quiz) {
      const err = new Error('This quiz expired or was not found. Please start a new one.');
      err.response = { status: 404, data: { detail: 'Quiz expired or not found. Please start a new one.' } };
      throw err;
    }

    const { answers, meta } = quiz;
    const review = [];
    const perTopic = {};

    answers.forEach((ans, i) => {
      const chosen = answersMap[String(i)] !== undefined ? answersMap[String(i)] : null;
      const isCorrect = chosen !== null && chosen === ans.correct;

      review.push({
        id: i,
        topic: ans.topic,
        correct: isCorrect,
        correct_index: ans.correct,
        your_index: chosen,
        explanation: ans.explanation,
      });

      if (!perTopic[ans.topic]) {
        perTopic[ans.topic] = { right: 0, total: 0 };
      }
      perTopic[ans.topic].total += 1;
      if (isCorrect) {
        perTopic[ans.topic].right += 1;
      }
    });

    const score = review.filter((r) => r.correct).length;
    const total = answers.length;
    const percent = total > 0 ? Math.round((100 * score) / total) : 0;

    const strong_topics = Object.keys(perTopic).filter(
      (topic) => perTopic[topic].right === perTopic[topic].total
    );
    const weak_topics = Object.keys(perTopic).filter(
      (topic) => perTopic[topic].right < perTopic[topic].total
    );

    let summary = '';
    if (weak_topics.length === 0) {
      summary = `Excellent: you answered every ${meta.skill} question correctly. Try the next difficulty level.`;
    } else {
      summary = `You scored ${percent}% on ${meta.skill}. `;
      if (strong_topics.length > 0) {
        summary += `You are solid on ${strong_topics.join(', ')}. `;
      }
      summary += `Revisit ${weak_topics.join(', ')} before retaking the quiz.`;
    }

    return {
      score,
      total,
      percent,
      level: meta.level,
      skill: meta.skill,
      strong_topics,
      weak_topics,
      summary,
      review,
    };
  }

  try {
    const response = await api.post(`/quiz/${quiz_id}/submit`, {
      answers: answersMap,
    });
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      const err = new Error('This quiz expired or was not found. Please start a new one.');
      err.status = 404;
      throw err;
    }
    throw new Error(normalizeApiError(error));
  }
}

export default {
  USE_MOCK,
  api,
  registerUnauthorizedHandler,
  normalizeApiError,
  signup,
  login,
  analyzeResume,
  getRoadmap,
  saveUserRoadmap,
  listUserRoadmaps,
  getUserRoadmap,
  updateUserTopicProgress,
  searchJobs,
  getMarketNews,
  startQuiz,
  submitQuiz,
};

