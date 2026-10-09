import axios from 'axios';

/**
 * Flag determining whether to use client-side mock data or live FastAPI backend.
 * Default is true as required. Configurable via VITE_USE_MOCK in .env
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

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
  if (error?.response?.status === 413) {
    return 'The uploaded file exceeds the 5 MB limit. Please choose a smaller file.';
  }
  if (error?.response?.status === 422) {
    return 'Invalid input format. Please check your resume text or file.';
  }
  if (error?.code === 'ECONNABORTED') {
    return 'Connection timed out. The server took too long to respond.';
  }
  if (error?.message === 'Network Error' || !error?.response) {
    return 'Unable to connect to the backend server (http://localhost:8000). Ensure the FastAPI server is running or enable mock mode.';
  }
  return error?.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Mock responses matching the contract with realistic data:
 * - Includes 4 options for /analyze
 * - Includes an 8-step roadmap for /roadmap
 */
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

const MOCK_ROADMAP_RESPONSE = {
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

// Helper mock delay to test loading states (~800ms)
const mockDelay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1) POST /analyze
 * Uploads file (PDF/DOCX max 5MB) or pasted resume text as multipart/form-data
 *
 * @param {{ file?: File, text?: string }} payload
 * @returns {Promise<{ skills: string[], current_role: { code: string, title: string }, risk_score: number, risk_label: string, options: Array }>}
 */
export async function analyzeResume({ file, text }) {
  if (USE_MOCK) {
    await mockDelay(850);
    // Return mock data, tailoring slightly if text matches a demo persona
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

/**
 * 2) POST /roadmap
 * Generates tailored step-by-step roadmap for selected target role and user's skills
 *
 * @param {{ role_code: string, skills: string[] }} payload
 * @returns {Promise<{ role: { code: string, title: string }, readiness: number, steps: Array }>}
 */
export async function getRoadmap({ role_code, skills }) {
  if (USE_MOCK) {
    await mockDelay(850);
    return MOCK_ROADMAP_RESPONSE;
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

export default {
  analyzeResume,
  getRoadmap,
  USE_MOCK,
  normalizeApiError,
};
