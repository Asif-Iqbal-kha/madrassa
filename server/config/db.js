const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not permitted
}

const connectDB = async () => {
  let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/madrassa_db';
  const isAtlas = uri.includes('mongodb+srv://') || uri.includes('mongodb.net');
  
  try {
    console.log(`Connecting to MongoDB${isAtlas ? ' Atlas Cloud Database...' : '...'}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isAtlas ? 15000 : 3000,
    });
    console.log(`=================================`);
    console.log(`  🍃 MongoDB Connected: ${conn.connection.host}`);
    console.log(`  Database: ${conn.connection.name}`);
    console.log(`=================================`);
    await checkAndSeed();
    return conn;
  } catch (error) {
    console.warn(`Direct connection note: ${error.message}`);
    console.log('Starting Embedded Local MongoDB Engine fallback...');
    try {
      const { startLocalMongo } = require('../localDb');
      uri = await startLocalMongo();
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
      await checkAndSeed();
      return conn;
    } catch (localErr) {
      console.error(`MongoDB Connection Error: ${localErr.message}`);
      throw localErr;
    }
  }
};

async function checkAndSeed() {
  try {
    const User = require('../models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Database empty. Creating initial admin user...');
      await User.create({
        name: 'ایڈمن',
        username: 'admin',
        password: 'admin123',
        role: 'master_admin',
      });
    } else {
      console.log(`Found existing data (${count} users). Skipping seed.`);
    }
  } catch (e) {
    console.log('Auto-seed check note:', e.message);
  }
}

module.exports = connectDB;
