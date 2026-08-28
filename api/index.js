require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');

// Public DNS for reliable MongoDB Atlas SRV resolution on serverless platforms
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cached MongoDB connection for Serverless execution
let isConnected = false;

async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('MONGO_URI is missing from environment variables');
    return;
  }
  const isAtlas = uri.includes('mongodb+srv://') || uri.includes('mongodb.net');
  const db = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: isAtlas ? 15000 : 5000,
  });
  isConnected = db.connections[0].readyState === 1;
}

// Ensure database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
  } catch (err) {
    console.error('Vercel Serverless Database Connection Error:', err.message);
  }
  next();
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Madrassa API is running on Vercel Serverless',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting',
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
