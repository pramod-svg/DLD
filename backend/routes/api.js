const express = require('express');
const router = express.Router();
const {
  getElection,
  createElection,
  resetElection,
  getCandidates,
  addCandidate,
  permitNextVoter,
  castVote,
  getResults
} = require('../controllers/electionController');

// Election Routes
router.get('/elections', getElection);
router.post('/elections', createElection);
router.post('/elections/reset', resetElection);
router.post('/session/permit', permitNextVoter);

// Candidate Routes
router.get('/candidates', getCandidates);
router.post('/candidates', addCandidate);

// Vote Routes
router.post('/votes', castVote);

// Result Routes
router.get('/results', getResults);

module.exports = router;
