require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');

// Atlas cloud connection string fallback
const ATLAS_FALLBACK_URI = 'mongodb+srv://asifyousafzai049_db_user:QfQ9F7puLSWm7vUq@cluster0.cp28fzk.mongodb.net/madrassa_db?retryWrites=true&w=majority';

// Use public DNS for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Cached MongoDB Connection for Serverless
let isConnected = false;

async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGO_URI || ATLAS_FALLBACK_URI;
  const isAtlas = uri.includes('mongodb+srv://') || uri.includes('mongodb.net');

  try {
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isAtlas ? 15000 : 5000,
    });
    isConnected = db.connections[0].readyState === 1;

    // Check if initial seeding is needed
    const User = require('../server/models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const seedDB = require('../server/seed');
      await seedDB();
    }
  } catch (err) {
    console.error('Serverless MongoDB Connection Error:', err);
    throw err;
  }
}

// Ensure database connection middleware on all /api requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Database connection middleware failed:', err.message);
    res.status(503).json({
      error: 'Database connection failed',
      message: err.message,
      suggestion: 'Please verify your MongoDB Atlas cluster and network access.',
    });
  }
});

// API Routes
app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/classes', require('../server/routes/classes'));
app.use('/api/students', require('../server/routes/students'));
app.use('/api/teachers', require('../server/routes/teachers'));
app.use('/api/news', require('../server/routes/news'));
app.use('/api/attendance', require('../server/routes/attendance'));
app.use('/api/exams', require('../server/routes/exams'));
app.use('/api/results', require('../server/routes/results'));
app.use('/api/donations', require('../server/routes/donations'));
app.use('/api/admissions', require('../server/routes/admissions'));
app.use('/api/gallery', require('../server/routes/gallery'));
app.use('/api/stats', require('../server/routes/stats'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Madrassa API is running on Vercel Serverless',
    database: mongoose.connection.readyState === 1 ? 'Connected to MongoDB Atlas' : 'Connecting...',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
