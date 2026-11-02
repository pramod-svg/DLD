const mongoose = require('mongoose');

let isConnected = false;
let fallbackStore = {
  election: null,
  candidates: [],
  votes: [],
  voterSessions: new Set()
};

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dld_voting_machine';
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[Database] Connected to MongoDB at ${mongoURI}`);
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed (${err.message}). Using robust in-memory/JSON fallback mode.`);
    isConnected = false;
  }
};

const getStatus = () => isConnected;
const getFallbackStore = () => fallbackStore;

module.exports = { connectDB, getStatus, getFallbackStore };
