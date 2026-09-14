const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') }); // Fallback to .env

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  grading: {
    boundaries: [
      { min: 90, grade: 'A+', point: 10 },
      { min: 80, grade: 'A',  point: 9 },
      { min: 70, grade: 'B+', point: 8 },
      { min: 60, grade: 'B',  point: 7 },
      { min: 50, grade: 'C',  point: 6 },
      { min: 40, grade: 'D',  point: 5 },
      { min: 0,  grade: 'F',  point: 0 },
    ],
  },
  rateLimit: {
    maxAttempts: 5,
    lockoutMinutes: 15,
  },
};
