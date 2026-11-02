const mongoose = require('mongoose');

const ElectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Student Council Digital Election 2026'
  },
  description: {
    type: String,
    default: 'Simulated educational election demonstrating Digital Logic Design (DLD) circuits in an Electronic Voting Machine.'
  },
  status: {
    type: String,
    enum: ['idle', 'running', 'paused', 'completed'],
    default: 'running'
  },
  ballotUnitLocked: {
    type: Boolean,
    default: false
  },
  currentVoterSessionId: {
    type: String,
    default: 'SESSION-0001'
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Election', ElectionSchema);
