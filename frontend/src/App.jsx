import React, { useState } from 'react';
import Navbar from './components/Layout/Navbar';
import HomePage from './components/Home/HomePage';
import ElectionSetup from './components/ElectionSetup/ElectionSetup';
import VotingMachine from './components/VotingMachine/VotingMachine';
import CircuitVisualization from './components/CircuitVisualization/CircuitVisualization';
import ResultsDashboard from './components/Results/ResultsDashboard';
import DLDLearningCenter from './components/Learning/DLDLearningCenter';

const PAGES = {
  HOME: 'home',
  SETUP: 'setup',
  VOTING: 'voting',
  CIRCUIT: 'circuit',
  RESULTS: 'results',
  LEARNING: 'learning',
};

export default function App() {
  const [page, setPage] = useState(PAGES.HOME);
  const [electionState, setElectionState] = useState(null);
  const [lastVoteSignals, setLastVoteSignals] = useState(null);

  const navigate = (p) => setPage(p);

  const renderPage = () => {
    switch (page) {
      case PAGES.HOME:
        return <HomePage navigate={navigate} />;
      case PAGES.SETUP:
        return <ElectionSetup navigate={navigate} onElectionReady={setElectionState} />;
      case PAGES.VOTING:
        return (
          <VotingMachine
            navigate={navigate}
            electionState={electionState}
            setElectionState={setElectionState}
            onVoteCast={setLastVoteSignals}
          />
        );
      case PAGES.CIRCUIT:
        return (
          <CircuitVisualization
            navigate={navigate}
            lastVoteSignals={lastVoteSignals}
            electionState={electionState}
          />
        );
      case PAGES.RESULTS:
        return <ResultsDashboard navigate={navigate} />;
      case PAGES.LEARNING:
        return <DLDLearningCenter navigate={navigate} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-logic-dark circuit-board-bg">
      <Navbar currentPage={page} navigate={navigate} />
      <main className="pt-16">{renderPage()}</main>
    </div>
  );
}
