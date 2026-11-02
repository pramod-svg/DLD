const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  voterSessionId: {
    type: String,
    required: true
  },
  candidateId: {
    type: Number,
    required: true
  },
  candidateName: {
    type: String
  },
  binaryCode: {
    type: String
  },
  // Educational DLD signal snapshot at the time of vote
  dldSignals: {
    inputLine: Number,
    encoderOutput: String, // e.g. "010"
    controlGateValid: Boolean,
    flipFlopStored: String,
    decoderLineActive: Number,
    counterValueBefore: Number,
    counterValueAfter: Number,
    sevenSegmentHex: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vote', VoteSchema);
