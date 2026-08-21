require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const aiBackendUrl = process.env.AI_BACKEND_URL || (isProduction ? undefined : 'http://127.0.0.1:8000');

if (isProduction && !aiBackendUrl) {
  throw new Error('AI_BACKEND_URL environment variable is required in production.');
}

const config = {
  port: process.env.PORT || 4000,
  aiBackendUrl,
};

module.exports = config;
