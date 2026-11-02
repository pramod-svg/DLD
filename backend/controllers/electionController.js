const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const { getStatus, getFallbackStore } = require('../config/db');

// Sample fictional candidates for initial simulation setup
const DEFAULT_CANDIDATES = [
  {
    candidateId: 1,
    name: 'Alice Henderson',
    partyOrTagline: 'Logic Innovators (LI)',
    symbol: '⚡',
    color: '#3b82f6',
    binaryCode: '001',
    voteCount: 0,
    displayOrder: 1
  },
  {
    candidateId: 2,
    name: 'Bob Montgomery',
    partyOrTagline: 'Binary Vanguard (BV)',
    symbol: '🛡️',
    color: '#10b981',
    binaryCode: '010',
    voteCount: 0,
    displayOrder: 2
  },
  {
    candidateId: 3,
    name: 'Clara Oswald',
    partyOrTagline: 'Silicon Frontier (SF)',
    symbol: '🚀',
    color: '#8b5cf6',
    binaryCode: '011',
    voteCount: 0,
    displayOrder: 3
  },
  {
    candidateId: 4,
    name: 'David Zhao',
    partyOrTagline: 'Quantum Progress (QP)',
    symbol: '🌟',
    color: '#f59e0b',
    binaryCode: '100',
    voteCount: 0,
    displayOrder: 4
  }
];

let sessionCounter = 1;

// Helper to initialize default data
const ensureInitialData = async () => {
  if (getStatus()) {
    let election = await Election.findOne();
    if (!election) {
      election = await Election.create({
        title: 'Digital Systems Student Election 2026',
        description: 'Simulated EVM demonstrating DLD Logic Gates, Encoders, D Flip-Flops, Counters, Decoders, and 7-Segment Displays.',
        status: 'running',
        ballotUnitLocked: false,
        currentVoterSessionId: `SESSION-${String(sessionCounter).padStart(4, '0')}`,
        totalVotes: 0
      });
    }

    const count = await Candidate.countDocuments();
    if (count === 0) {
      await Candidate.insertMany(DEFAULT_CANDIDATES);
    }
    return election;
  } else {
    // Fallback store
    const store = getFallbackStore();
    if (!store.election) {
      store.election = {
        _id: 'default-sim-1',
        title: 'Digital Systems Student Election 2026',
        description: 'Simulated EVM demonstrating DLD Logic Gates, Encoders, D Flip-Flops, Counters, Decoders, and 7-Segment Displays.',
        status: 'running',
        ballotUnitLocked: false,
        currentVoterSessionId: `SESSION-${String(sessionCounter).padStart(4, '0')}`,
        totalVotes: 0,
        createdAt: new Date()
      };
      store.candidates = JSON.parse(JSON.stringify(DEFAULT_CANDIDATES));
      store.votes = [];
      store.voterSessions = new Set();
    }
    return store.election;
  }
};

// GET /api/elections
exports.getElection = async (req, res) => {
  try {
    await ensureInitialData();
    if (getStatus()) {
      const election = await Election.findOne();
      return res.json({ success: true, data: election });
    } else {
      const store = getFallbackStore();
      return res.json({ success: true, data: store.election });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/elections
exports.createElection = async (req, res) => {
  try {
    const { title, description, candidates } = req.body;
    sessionCounter = 1;

    if (getStatus()) {
      await Election.deleteMany({});
      await Candidate.deleteMany({});
      await Vote.deleteMany({});

      const election = await Election.create({
        title: title || 'New Digital Election',
        description: description || 'DLD Voting Simulator Session',
        status: 'running',
        ballotUnitLocked: false,
        currentVoterSessionId: 'SESSION-0001',
        totalVotes: 0
      });

      const candidateList = (candidates && candidates.length > 0)
        ? candidates.map((c, index) => {
            const cid = index + 1;
            return {
              candidateId: cid,
              name: c.name || `Candidate ${cid}`,
              partyOrTagline: c.partyOrTagline || 'Independent',
              symbol: c.symbol || '🗳️',
              color: c.color || '#3b82f6',
              binaryCode: cid.toString(2).padStart(3, '0'),
              voteCount: 0,
              displayOrder: cid
            };
          })
        : DEFAULT_CANDIDATES;

      await Candidate.insertMany(candidateList);

      const savedCandidates = await Candidate.find().sort({ displayOrder: 1 });
      return res.json({ success: true, election, candidates: savedCandidates });
    } else {
      const store = getFallbackStore();
      store.election = {
        _id: 'sim-' + Date.now(),
        title: title || 'New Digital Election',
        description: description || 'DLD Voting Simulator Session',
        status: 'running',
        ballotUnitLocked: false,
        currentVoterSessionId: 'SESSION-0001',
        totalVotes: 0,
        createdAt: new Date()
      };

      const candidateList = (candidates && candidates.length > 0)
        ? candidates.map((c, index) => {
            const cid = index + 1;
            return {
              candidateId: cid,
              name: c.name || `Candidate ${cid}`,
              partyOrTagline: c.partyOrTagline || 'Independent',
              symbol: c.symbol || '🗳️',
              color: c.color || '#3b82f6',
              binaryCode: cid.toString(2).padStart(3, '0'),
              voteCount: 0,
              displayOrder: cid
            };
          })
        : JSON.parse(JSON.stringify(DEFAULT_CANDIDATES));

      store.candidates = candidateList;
      store.votes = [];
      store.voterSessions = new Set();

      return res.json({ success: true, election: store.election, candidates: store.candidates });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/elections/reset
exports.resetElection = async (req, res) => {
  try {
    sessionCounter = 1;
    if (getStatus()) {
      await Election.deleteMany({});
      await Candidate.deleteMany({});
      await Vote.deleteMany({});

      const election = await Election.create({
        title: 'Digital Systems Student Election 2026',
        description: 'Simulated EVM demonstrating DLD Logic Gates, Encoders, D Flip-Flops, Counters, Decoders, and 7-Segment Displays.',
        status: 'running',
        ballotUnitLocked: false,
        currentVoterSessionId: 'SESSION-0001',
        totalVotes: 0
      });

      await Candidate.insertMany(DEFAULT_CANDIDATES);
      const candidates = await Candidate.find().sort({ displayOrder: 1 });
      return res.json({
        success: true,
        message: 'Simulation reset successfully to initial state.',
        election,
        candidates
      });
    } else {
      const store = getFallbackStore();
      store.election = {
        _id: 'default-sim-1',
        title: 'Digital Systems Student Election 2026',
        description: 'Simulated EVM demonstrating DLD Logic Gates, Encoders, D Flip-Flops, Counters, Decoders, and 7-Segment Displays.',
        status: 'running',
        ballotUnitLocked: false,
        currentVoterSessionId: 'SESSION-0001',
        totalVotes: 0,
        createdAt: new Date()
      };
      store.candidates = JSON.parse(JSON.stringify(DEFAULT_CANDIDATES));
      store.votes = [];
      store.voterSessions = new Set();
      return res.json({
        success: true,
        message: 'Simulation reset successfully to initial state.',
        election: store.election,
        candidates: store.candidates
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/candidates
exports.getCandidates = async (req, res) => {
  try {
    await ensureInitialData();
    if (getStatus()) {
      const candidates = await Candidate.find().sort({ displayOrder: 1 });
      return res.json({ success: true, count: candidates.length, data: candidates });
    } else {
      const store = getFallbackStore();
      return res.json({ success: true, count: store.candidates.length, data: store.candidates });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/candidates
exports.addCandidate = async (req, res) => {
  try {
    const { name, partyOrTagline, symbol, color } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Candidate name is required' });
    }

    if (getStatus()) {
      const totalCandidates = await Candidate.countDocuments();
      if (totalCandidates >= 8) {
        return res.status(400).json({ success: false, error: 'Maximum 8 candidates supported in 3-bit binary encoding (000 to 111)' });
      }
      const nextId = totalCandidates + 1;
      const binaryCode = nextId.toString(2).padStart(3, '0');

      const candidate = await Candidate.create({
        candidateId: nextId,
        name,
        partyOrTagline: partyOrTagline || 'Independent',
        symbol: symbol || '🗳️',
        color: color || '#3b82f6',
        binaryCode,
        voteCount: 0,
        displayOrder: nextId
      });

      return res.status(201).json({ success: true, data: candidate });
    } else {
      const store = getFallbackStore();
      if (store.candidates.length >= 8) {
        return res.status(400).json({ success: false, error: 'Maximum 8 candidates supported in 3-bit binary encoding' });
      }
      const nextId = store.candidates.length + 1;
      const binaryCode = nextId.toString(2).padStart(3, '0');

      const candidate = {
        candidateId: nextId,
        name,
        partyOrTagline: partyOrTagline || 'Independent',
        symbol: symbol || '🗳️',
        color: color || '#3b82f6',
        binaryCode,
        voteCount: 0,
        displayOrder: nextId
      };
      store.candidates.push(candidate);
      return res.status(201).json({ success: true, data: candidate });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/session/permit - Control Unit authorizes the next voter
exports.permitNextVoter = async (req, res) => {
  try {
    sessionCounter++;
    const nextSessionId = `SESSION-${String(sessionCounter).padStart(4, '0')}`;

    if (getStatus()) {
      const election = await Election.findOne();
      if (!election) {
        return res.status(404).json({ success: false, error: 'Election not found' });
      }
      election.ballotUnitLocked = false;
      election.currentVoterSessionId = nextSessionId;
      await election.save();

      return res.json({
        success: true,
        message: 'Control Unit ballot released! Ready LED active.',
        election: {
          ballotUnitLocked: false,
          currentVoterSessionId: nextSessionId,
          totalVotes: election.totalVotes
        }
      });
    } else {
      const store = getFallbackStore();
      store.election.ballotUnitLocked = false;
      store.election.currentVoterSessionId = nextSessionId;

      return res.json({
        success: true,
        message: 'Control Unit ballot released! Ready LED active.',
        election: {
          ballotUnitLocked: false,
          currentVoterSessionId: nextSessionId,
          totalVotes: store.election.totalVotes
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/votes - Register a simulated vote
exports.castVote = async (req, res) => {
  try {
    const { candidateId, voterSessionId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ success: false, error: 'Candidate ID is required' });
    }

    if (getStatus()) {
      const election = await Election.findOne();
      if (!election) {
        return res.status(404).json({ success: false, error: 'Election does not exist' });
      }

      if (election.status !== 'running') {
        return res.status(400).json({
          success: false,
          error: `Election is currently ${election.status}. Voting is not allowed.`
        });
      }

      // Check if Ballot Unit is locked
      if (election.ballotUnitLocked) {
        return res.status(403).json({
          success: false,
          error: 'EVM Ballot Unit is LOCKED! Previous vote registered. Please press "Permit / Balloting" on Control Unit for next voter.'
        });
      }

      // Check session duplicate prevention
      const activeSession = voterSessionId || election.currentVoterSessionId;
      const existingVote = await Vote.findOne({ voterSessionId: activeSession });
      if (existingVote) {
        return res.status(403).json({
          success: false,
          error: `Duplicate vote rejected! Voter session ${activeSession} has already cast a vote.`
        });
      }

      const candidate = await Candidate.findOne({ candidateId: Number(candidateId) });
      if (!candidate) {
        return res.status(404).json({ success: false, error: `Candidate with ID ${candidateId} not found` });
      }

      // DLD Digital Logic Calculations
      const inputLine = candidate.candidateId;
      const encoderOutput = candidate.binaryCode;
      const controlGateValid = true; // SELECTED && ENABLE && !LOCKED
      const flipFlopStored = candidate.binaryCode;
      const decoderLineActive = candidate.candidateId;
      const counterValueBefore = candidate.voteCount;
      const counterValueAfter = candidate.voteCount + 1;
      const totalVotesAfter = election.totalVotes + 1;

      // Save Vote
      const voteRecord = await Vote.create({
        voterSessionId: activeSession,
        candidateId: candidate.candidateId,
        candidateName: candidate.name,
        binaryCode: candidate.binaryCode,
        dldSignals: {
          inputLine,
          encoderOutput,
          controlGateValid,
          flipFlopStored,
          decoderLineActive,
          counterValueBefore,
          counterValueAfter,
          sevenSegmentHex: totalVotesAfter.toString(16).toUpperCase()
        }
      });

      // Update candidate & election counts, lock ballot unit
      candidate.voteCount = counterValueAfter;
      await candidate.save();

      election.totalVotes = totalVotesAfter;
      election.ballotUnitLocked = true;
      await election.save();

      return res.status(201).json({
        success: true,
        message: `Vote successfully registered for ${candidate.name} (Code: ${candidate.binaryCode})!`,
        vote: voteRecord,
        candidate: {
          id: candidate.candidateId,
          name: candidate.name,
          voteCount: candidate.voteCount,
          binaryCode: candidate.binaryCode
        },
        dldSignals: voteRecord.dldSignals,
        election: {
          totalVotes: election.totalVotes,
          ballotUnitLocked: true,
          currentVoterSessionId: activeSession
        }
      });
    } else {
      // Fallback in-memory
      const store = getFallbackStore();
      const election = store.election;

      if (!election || election.status !== 'running') {
        return res.status(400).json({ success: false, error: 'Election not running' });
      }

      if (election.ballotUnitLocked) {
        return res.status(403).json({
          success: false,
          error: 'EVM Ballot Unit is LOCKED! Press "Permit / Balloting" on Control Unit for next voter.'
        });
      }

      const activeSession = voterSessionId || election.currentVoterSessionId;
      if (store.voterSessions.has(activeSession)) {
        return res.status(403).json({
          success: false,
          error: `Duplicate vote rejected! Voter session ${activeSession} has already cast a vote.`
        });
      }

      const candidate = store.candidates.find(c => c.candidateId === Number(candidateId));
      if (!candidate) {
        return res.status(404).json({ success: false, error: `Candidate ${candidateId} not found` });
      }

      const counterValueBefore = candidate.voteCount;
      const counterValueAfter = candidate.voteCount + 1;
      const totalVotesAfter = election.totalVotes + 1;

      const dldSignals = {
        inputLine: candidate.candidateId,
        encoderOutput: candidate.binaryCode,
        controlGateValid: true,
        flipFlopStored: candidate.binaryCode,
        decoderLineActive: candidate.candidateId,
        counterValueBefore,
        counterValueAfter,
        sevenSegmentHex: totalVotesAfter.toString(16).toUpperCase()
      };

      const voteRecord = {
        _id: 'vote-' + Date.now(),
        voterSessionId: activeSession,
        candidateId: candidate.candidateId,
        candidateName: candidate.name,
        binaryCode: candidate.binaryCode,
        dldSignals,
        timestamp: new Date()
      };

      candidate.voteCount = counterValueAfter;
      election.totalVotes = totalVotesAfter;
      election.ballotUnitLocked = true;
      store.votes.push(voteRecord);
      store.voterSessions.add(activeSession);

      return res.status(201).json({
        success: true,
        message: `Vote successfully registered for ${candidate.name} (Code: ${candidate.binaryCode})!`,
        vote: voteRecord,
        candidate: {
          id: candidate.candidateId,
          name: candidate.name,
          voteCount: candidate.voteCount,
          binaryCode: candidate.binaryCode
        },
        dldSignals,
        election: {
          totalVotes: election.totalVotes,
          ballotUnitLocked: true,
          currentVoterSessionId: activeSession
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/results
exports.getResults = async (req, res) => {
  try {
    await ensureInitialData();
    let election;
    let candidates;
    let totalVotes = 0;

    if (getStatus()) {
      election = await Election.findOne();
      candidates = await Candidate.find().sort({ displayOrder: 1 });
      totalVotes = election ? election.totalVotes : 0;
    } else {
      const store = getFallbackStore();
      election = store.election;
      candidates = store.candidates;
      totalVotes = election ? election.totalVotes : 0;
    }

    const candidateResults = candidates.map(c => {
      const percentage = totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : '0.0';
      return {
        candidateId: c.candidateId,
        name: c.name,
        partyOrTagline: c.partyOrTagline,
        symbol: c.symbol,
        color: c.color,
        binaryCode: c.binaryCode,
        voteCount: c.voteCount,
        percentage: Number(percentage)
      };
    });

    let leader = null;
    if (totalVotes > 0) {
      const sorted = [...candidateResults].sort((a, b) => b.voteCount - a.voteCount);
      if (sorted.length > 0 && sorted[0].voteCount > 0) {
        leader = sorted[0];
      }
    }

    return res.json({
      success: true,
      electionStatus: election ? election.status : 'running',
      ballotUnitLocked: election ? election.ballotUnitLocked : false,
      currentVoterSessionId: election ? election.currentVoterSessionId : 'SESSION-0001',
      totalVotes,
      candidates: candidateResults,
      leader
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
