const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const connectDB = require('./config/db');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/teachers', require('./routes/teacher.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/subjects', require('./routes/subject.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/marks', require('./routes/marks.routes'));
app.use('/api/exams', require('./routes/exam.routes'));
app.use('/api/assignments', require('./routes/assignment.routes'));
app.use('/api/timetable', require('./routes/timetable.routes'));
app.use('/api/notices', require('./routes/notice.routes'));
app.use('/api/fees', require('./routes/fee.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Student Management System API. Please use /api endpoints.' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SMS API is running', timestamp: new Date().toISOString() });
});

// ── Error Handler ──────────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`
  🎓 Student Management System — API Server
  ➜  Local: http://localhost:${config.port}
  ➜  Mode:  ${config.nodeEnv}
  ➜  DB:    MongoDB
    `);
  });
};

start();

module.exports = app;
