const express = require('express');
const router = express.Router();
const aiClient = require('../services/aiClient');

// POST /api/extract-skills
router.post('/extract-skills', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "text" field in request body' });
  }

  try {
    const data = await aiClient.extractSkills(text);
    return res.json(data);
  } catch (error) {
    console.error('Error extracting skills:', error.message);
    return res.status(500).json({ error: 'Failed to extract skills' });
  }
});

// POST /api/match
router.post('/match', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "text" field in request body' });
  }

  try {
    const data = await aiClient.matchOccupations(text);
    return res.json(data);
  } catch (error) {
    console.error('Error matching occupations:', error.message);
    return res.status(500).json({ error: 'Failed to match occupations' });
  }
});

// GET /api/gap/:occupationId?text=...
router.get('/gap/:occupationId', async (req, res) => {
  const { occupationId } = req.params;
  const { text } = req.query;

  if (!occupationId) {
    return res.status(400).json({ error: 'Missing "occupationId" route parameter' });
  }

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "text" query parameter' });
  }

  try {
    const data = await aiClient.getGapAnalysis(occupationId, text);
    return res.json(data);
  } catch (error) {
    console.error('Error analyzing skill gap:', error.message);
    return res.status(500).json({ error: 'Failed to analyze skill gap' });
  }
});

module.exports = router;
