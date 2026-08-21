require('dotenv').config();

const config = {
  port: process.env.PORT || 4000,
  aiBackendUrl: process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000',
};

module.exports = config;
