const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  candidateId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  partyOrTagline: {
    type: String,
    default: 'Independent'
  },
  symbol: {
    type: String,
    required: true,
    default: '🚀'
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  binaryCode: {
    type: String, // e.g. "001", "010", "011", "100"
    required: true
  },
  voteCount: {
    type: Number,
    default: 0
  },
  displayOrder: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model('Candidate', CandidateSchema);
