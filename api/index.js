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

// Enable CORS for all origins and headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

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
    const Donation = require('../server/models/Donation');
    const Student = require('../server/models/Student');
    const userCount = await User.countDocuments();
    const donationCount = await Donation.countDocuments();
    const studentCount = await Student.countDocuments();

    if (userCount === 0) {
      const User = require('../server/models/User');
      await User.create({
        name: 'ایڈمن',
        username: 'admin',
        password: 'admin123',
        role: 'master_admin',
      });
    }
  } catch (err) {
    console.error('Serverless MongoDB Connection Error:', err);
    throw err;
  }
}

// Ensure database connection middleware on all requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Database connection middleware failed:', err.message);
    res.status(503).json({
      error: 'Database connection failed',
      message: err.message,
    });
  }
});

// Import route modules
const authRoutes = require('../server/routes/auth');
const classRoutes = require('../server/routes/classes');
const studentRoutes = require('../server/routes/students');
const teacherRoutes = require('../server/routes/teachers');
const newsRoutes = require('../server/routes/news');
const attendanceRoutes = require('../server/routes/attendance');
const examRoutes = require('../server/routes/exams');
const resultRoutes = require('../server/routes/results');
const donationRoutes = require('../server/routes/donations');
const admissionRoutes = require('../server/routes/admissions');
const galleryRoutes = require('../server/routes/gallery');
const statsRoutes = require('../server/routes/stats');

// Mount routes for BOTH '/api/...' and '/...' so Vercel path rewrites always match 100%
const routePairs = [
  ['/auth', authRoutes],
  ['/classes', classRoutes],
  ['/students', studentRoutes],
  ['/teachers', teacherRoutes],
  ['/news', newsRoutes],
  ['/attendance', attendanceRoutes],
  ['/exams', examRoutes],
  ['/results', resultRoutes],
  ['/donations', donationRoutes],
  ['/admissions', admissionRoutes],
  ['/gallery', galleryRoutes],
  ['/stats', statsRoutes],
];

routePairs.forEach(([path, handler]) => {
  app.use(`/api${path}`, handler);
  app.use(path, handler);
});

// Health check endpoint
const healthHandler = (req, res) => {
  res.json({
    status: 'OK',
    message: 'Madrassa API is running on Vercel Serverless',
    database: mongoose.connection.readyState === 1 ? 'Connected to MongoDB Atlas' : 'Connecting...',
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
