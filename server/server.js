const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// --- Industry-Standard Security & Logging ---
// Use Helmet to secure HTTP headers, but allow our CDNs (Leaflet, Chart.js, Fonts, Tesseract)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://unpkg.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.basemaps.cartocdn.com", "https://unpkg.com"],
      connectSrc: ["'self'", "http://localhost:5000", "https://tessdata.projectnaptha.com"]
    }
  }
}));

// HTTP request logger
app.use(morgan('dev'));

// Rate limiting to prevent API abuse (DDoS protection)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// --- Standard Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client/public')));

// --- API Routes ---
app.use('/api/issues', require('./routes/issues'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/match', require('./routes/match'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/ai', require('./routes/ai'));

// Catch-all: serve index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]', err.stack);
  res.status(500).json({ 
    error: 'An internal server error occurred.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});