const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ats_chatbot',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_ats_chatbot_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  discordClientId: process.env.DISCORD_CLIENT_ID,
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
  aiProvider: process.env.AI_PROVIDER || 'mock',
  aiApiKey: process.env.AI_API_KEY,
  maxResumeFileSizeMB: parseInt(process.env.MAX_RESUME_FILE_SIZE_MB || '10', 10),
  maxJdFileSizeMB: parseInt(process.env.MAX_JD_FILE_SIZE_MB || '10', 10)
};
