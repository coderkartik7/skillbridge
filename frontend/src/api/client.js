import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Extract skills from resume or free text
 * @param {string} text 
 * @returns {Promise<{ skills: string[] }>}
 */
export async function extractSkills(text) {
  try {
    const response = await api.post('/extract-skills', { text });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.message || 'Failed to extract skills. Please check your backend connection.';
    throw new Error(message);
  }
}

/**
 * Match text against occupations
 * @param {string} text 
 * @returns {Promise<{ matches: Array<[string, string, number]> }>}
 */
export async function matchOccupations(text) {
  try {
    const response = await api.post('/match', { text });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.message || 'Failed to match occupations. Please check your backend connection.';
    throw new Error(message);
  }
}

/**
 * Perform skill gap analysis for a specific occupation
 * @param {string} occupationCode 
 * @param {string} text 
 * @returns {Promise<{ missing_skills: Array<{ skill_id: number, skill_name: string, relevance: number, is_trending: boolean }> }>}
 */
export async function getGapAnalysis(occupationCode, text) {
  try {
    const response = await api.get(`/gap/${encodeURIComponent(occupationCode)}`, {
      params: { text },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.message || 'Failed to analyze skill gap. Please check your backend connection.';
    throw new Error(message);
  }
}
