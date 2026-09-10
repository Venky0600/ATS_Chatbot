const mongoose = require('mongoose');
const env = require('./environment');

let isInMemoryMode = false;
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to real MongoDB (${error.message}).`);
    console.warn(`[Database Warning] Using fallback mock storage mode for DB queries.`);
    isInMemoryMode = true;
    return null;
  }
};

const getInMemoryMode = () => isInMemoryMode;

module.exports = {
  connectDB,
  getInMemoryMode
};
