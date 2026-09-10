const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const jdRoutes = require('./routes/jd.routes');
const analysisRoutes = require('./routes/analysis.routes');
const errorHandler = require('./middleware/error.middleware');
const { sendSuccess } = require('./utils/response');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  return sendSuccess(res, { status: 'UP', timestamp: new Date() }, 'Backend is running healthy');
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/job-descriptions', jdRoutes);
app.use('/api/v1/analyses', analysisRoutes);

// Catch-all 404 Route
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

// Global Error Handling Middleware
app.use(errorHandler);

module.exports = app;
