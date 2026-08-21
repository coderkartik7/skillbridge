const axios = require('axios');
const { aiBackendUrl } = require('../config/env');

const apiClient = axios.create({
  baseURL: aiBackendUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extract skills from text
 * @param {string} text - Resume or free text
 * @returns {Promise<Object>} { skills: [...] }
 */
async function extractSkills(text) {
  const response = await apiClient.post('/extract-skills', { text });
  return response.data;
}

/**
 * Match text against occupations
 * @param {string} text - Resume or free text
 * @returns {Promise<Object>} { matches: [...] }
 */
async function matchOccupations(text) {
  const response = await apiClient.post('/match', { text });
  return response.data;
}

/**
 * Perform skill gap analysis for occupation
 * @param {string} occupationId - Occupation code (e.g., "15-2051.00")
 * @param {string} text - Resume or skills text
 * @returns {Promise<Object>} { missing_skills: [...] }
 */
async function getGapAnalysis(occupationId, text) {
  const response = await apiClient.get(`/gap/${encodeURIComponent(occupationId)}`, {
    params: { text },
  });
  return response.data;
}

module.exports = {
  extractSkills,
  matchOccupations,
  getGapAnalysis,
};
