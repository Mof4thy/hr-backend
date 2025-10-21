require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { securityHeaders, basicSQLProtection, basicLimiter } = require('./middleware/simpleSecurity');

const app = express();



// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));


app.use(securityHeaders);
app.use(basicSQLProtection);
app.use('/api/', basicLimiter);


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const uploadRoutes = require('./routes/uploads');
const jobsRoutes = require('./routes/jobs');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/jobs', jobsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HR Management System Backend API',
    version: '1.0.0',
    status: 'Running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      applications: '/api/applications',
      uploads: '/api/uploads',
      jobs: '/api/jobs',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
