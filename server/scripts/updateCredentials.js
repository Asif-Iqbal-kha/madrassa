/**
 * Update / Synchronize Admin & Teacher Credentials
 * 
 * Usage:
 *   node server/scripts/updateCredentials.js
 *   or: npm run update-credentials
 * 
 * Reads credentials directly from server/.env and securely updates the database.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

const mongoose = require('mongoose');
const ensureAuthUsers = require('../config/ensureAuthUsers');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ Error: MONGO_URI is not defined in server/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(uri);
    console.log('✓ Connected.\n');

    console.log('Synchronizing Admin & Teacher credentials from .env:');
    console.log('  Admin Username:   ', process.env.ADMIN_USERNAME || 'admin_sadeeq');
    console.log('  Admin Password:   ', '•••••••••••• (Secured in .env)');
    console.log('  Teacher Username: ', process.env.TEACHER_USERNAME || 'teacher_sadeeq');
    console.log('  Teacher Password: ', '•••••••••••• (Secured in .env)\n');

    const result = await ensureAuthUsers();

    console.log('\n======================================================');
    console.log('  ✅ CREDENTIALS SYNCHRONIZED SUCCESSFULLY IN DATABASE');
    console.log('======================================================');
    console.log(`  Admin Login:   ${result.admin.username} / [as set in .env]`);
    console.log(`  Teacher Login: ${result.teacher.username} / [as set in .env]`);
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update credentials:', err);
    process.exit(1);
  }
}

run();
