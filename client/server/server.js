const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/news', require('./routes/news'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/results', require('./routes/results'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/admissions', require('./routes/admissions'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/stats', require('./routes/stats'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Madrassa API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'فائل کا سائز 5MB سے زیادہ ہے' });
  }
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ message: 'صرف تصویری فائلز (JPG, PNG, WebP) اپلوڈ کریں' });
  }

  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n=================================`);
      console.log(`  🚀 Madrassa API Server Ready`);
      console.log(`  Port: ${PORT}`);
      console.log(`  Database: Connected to MongoDB`);
      console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=================================\n`);
    });
  })
  .catch((err) => {
    app.listen(PORT, () => {
      console.log(`\n=================================`);
      console.log(`  🚀 Madrassa API Server Running`);
      console.log(`  Port: ${PORT}`);
      console.log(`  Database: ⏳ Offline (Awaiting MongoDB installation)`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=================================\n`);
    });
  });

module.exports = app;


