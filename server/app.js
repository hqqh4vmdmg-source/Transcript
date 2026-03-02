const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const transcriptRoutes = require('./routes/transcriptRoutes');
const sealRoutes = require('./routes/sealRoutes');
const generatorRoutes = require('./routes/generatorRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const designSystemRoutes = require('./routes/designSystemRoutes');
const academicRoutes = require('./routes/academicRoutes');

const app = express();

// Security headers
app.use(helmet());

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Serve static files (for seal images)
app.use('/seals', express.static(path.join(__dirname, 'public/seals')));

// Auth rate limiter – protect login/register from brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/transcripts', transcriptRoutes);
app.use('/api/seals', sealRoutes);
app.use('/api/generator', generatorRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/design', designSystemRoutes);
app.use('/api/academic', academicRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
