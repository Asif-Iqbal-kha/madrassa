const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

let mongodInstance = null;

async function startLocalMongo() {
  try {
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        port: 27017,
      },
    });
    const uri = mongodInstance.getUri();
    console.log(`\n=================================`);
    console.log(`  🍃 MongoDB Database Online!`);
    console.log(`  URI: ${uri}`);
    console.log(`=================================\n`);
    return uri;
  } catch (error) {
    console.log('MongoDB Engine fallback:', error.message);
    return 'mongodb://localhost:27017/madrassa_db';
  }
}

module.exports = { startLocalMongo };



