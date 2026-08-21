const express = require('express');
const cors = require('cors');
const { port } = require('./config/env');
const resumeRoutes = require('./routes/resume');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', resumeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SkillBridge Node.js backend' });
});

// Start server
app.listen(port, () => {
  console.log(`SkillBridge app-backend running on http://localhost:${port}`);
});

module.exports = app;
