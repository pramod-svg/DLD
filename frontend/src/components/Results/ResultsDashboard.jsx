import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  TrendingUp,
  Users,
  BarChart3,
  PieChart,
  RefreshCw,
  RotateCcw,
  ArrowLeft,
  Cpu,
  Hash,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { api } from '../../api/api.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const DEFAULT_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a855f7',
];

function numberToBinary(n, bits = 8) {
  return (n >>> 0).toString(2).padStart(bits, '0');
}

function BinaryDisplay({ value, bits = 8 }) {
  const binary = numberToBinary(value, bits);
  return (
    <span className="inline-flex gap-0.5">
      {binary.split('').map((bit, i) => (
        <span key={i} className={`binary-bit ${bit === '1' ? 'high' : 'low'}`}>
          {bit}
        </span>
      ))}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, subValue, color = 'emerald', children }) {
  return (
    <div className="card-glow flex flex-col gap-2">
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Icon size={16} className={`text-${color}-400`} />
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-100">{value}</div>
      {subValue && <div className="text-xs text-slate-500">{subValue}</div>}
      {children}
    </div>
  );
}

export default function ResultsDashboard({ navigate }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchResults = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await api.getResults();
      if (data.success === false) {
        setError(data.error || 'Failed to fetch results');
      } else {
        setResults(data);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(() => fetchResults(), 5000);
    return () => clearInterval(interval);
  }, [fetchResults]);

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset the election? All votes will be lost.')) return;
    setResetting(true);
    try {
      await api.resetElection();
      await fetchResults();
    } catch (err) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  };

  // Derive data from results
  const candidates = results?.candidates || results?.results || [];
  const totalVotes = results?.totalVotes ?? candidates.reduce((sum, c) => sum + (c.votes || c.voteCount || 0), 0);
  const electionStatus = results?.election?.status || results?.status || 'unknown';
  const ballotLocked = results?.election?.ballotLocked ?? results?.ballotLocked ?? true;
  const voteLog = results?.recentVotes || results?.voteLog || [];

  // Sort candidates by votes descending
  const sortedCandidates = [...candidates].sort((a, b) => {
    const aVotes = a.votes ?? a.voteCount ?? 0;
    const bVotes = b.votes ?? b.voteCount ?? 0;
    return bVotes - aVotes;
  });

  const leader = sortedCandidates.length > 0 ? sortedCandidates[0] : null;
  const leaderVotes = leader ? (leader.votes ?? leader.voteCount ?? 0) : 0;

  // Assign colors to candidates
  const getCandidateColor = (candidate, idx) => candidate.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];

  // ---- Chart Data ----
  const barData = {
    labels: sortedCandidates.map((c) => c.name || c.candidateName || `Candidate ${c.id}`),
    datasets: [
      {
        label: 'Votes',
        data: sortedCandidates.map((c) => c.votes ?? c.voteCount ?? 0),
        backgroundColor: sortedCandidates.map((c, i) => getCandidateColor(c, i) + 'CC'),
        borderColor: sortedCandidates.map((c, i) => getCandidateColor(c, i)),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Votes per Candidate',
        color: '#e2e8f0',
        font: { size: 14, weight: '600' },
        padding: { bottom: 16 },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (ctx) => {
            const pct = totalVotes > 0 ? ((ctx.raw / totalVotes) * 100).toFixed(1) : 0;
            return `${ctx.raw} votes (${pct}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8',
          stepSize: 1,
          font: { size: 11 },
        },
        grid: { color: '#1e293b', drawBorder: false },
      },
      y: {
        ticks: {
          color: '#e2e8f0',
          font: { size: 12 },
        },
        grid: { display: false },
      },
    },
  };

  const pieData = {
    labels: sortedCandidates.map((c) => c.name || c.candidateName || `Candidate ${c.id}`),
    datasets: [
      {
        data: sortedCandidates.map((c) => c.votes ?? c.voteCount ?? 0),
        backgroundColor: sortedCandidates.map((c, i) => getCandidateColor(c, i) + 'CC'),
        borderColor: sortedCandidates.map((c, i) => getCandidateColor(c, i)),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          padding: 16,
          font: { size: 12 },
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      title: {
        display: true,
        text: 'Vote Distribution',
        color: '#e2e8f0',
        font: { size: 14, weight: '600' },
        padding: { bottom: 16 },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (ctx) => {
            const pct = totalVotes > 0 ? ((ctx.raw / totalVotes) * 100).toFixed(1) : 0;
            return ` ${ctx.label}: ${ctx.raw} votes (${pct}%)`;
          },
        },
      },
    },
  };

  // ---- Render ----

  if (loading) {
    return (
      <div className="min-h-screen bg-logic-dark circuit-board-bg pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw size={32} className="text-emerald-400 animate-spin" />
          <p className="text-slate-400">Loading results…</p>
        </div>
      </div>
    );
  }

  if (error && !results) {
    return (
      <div className="min-h-screen bg-logic-dark circuit-board-bg pt-20 flex items-center justify-center">
        <div className="card-glow max-w-md text-center space-y-4">
          <AlertCircle size={40} className="text-red-400 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-100">Error Loading Results</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          <button onClick={() => fetchResults(true)} className="btn-primary mx-auto">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const noVotes = totalVotes === 0;

  return (
    <div className="min-h-screen bg-logic-dark circuit-board-bg pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <BarChart3 size={24} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Election Results Dashboard</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Real-time vote analysis &amp; statistics
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchResults(true)}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* ─── Top Stats Row ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Votes */}
          <StatCard icon={Users} label="Total Votes" value={totalVotes} color="emerald">
            <BinaryDisplay value={totalVotes} bits={8} />
          </StatCard>

          {/* Leading Candidate */}
          <StatCard
            icon={Trophy}
            label="Leading Candidate"
            value={leader ? (leader.name || leader.candidateName || '—') : '—'}
            subValue={leader ? `${leaderVotes} vote${leaderVotes !== 1 ? 's' : ''}` : 'No votes yet'}
            color="yellow"
          />

          {/* Election Status */}
          <StatCard icon={TrendingUp} label="Election Status" color="cyan" value="">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                electionStatus === 'running' || electionStatus === 'active'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : electionStatus === 'completed'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  electionStatus === 'running' || electionStatus === 'active'
                    ? 'bg-emerald-400 animate-pulse'
                    : electionStatus === 'completed'
                    ? 'bg-blue-400'
                    : 'bg-slate-500'
                }`}
              />
              {electionStatus.charAt(0).toUpperCase() + electionStatus.slice(1)}
            </span>
          </StatCard>

          {/* Ballot Unit Status */}
          <StatCard icon={Cpu} label="Ballot Unit Status" color="indigo" value="">
            <div className="flex items-center gap-2">
              <div className={`led-indicator ${ballotLocked ? 'off' : 'on'}`} />
              <span className={`text-sm font-medium ${ballotLocked ? 'text-slate-400' : 'text-emerald-400'}`}>
                {ballotLocked ? 'Locked' : 'Unlocked'}
              </span>
            </div>
          </StatCard>
        </div>

        {/* ─── No Votes State ─── */}
        {noVotes && (
          <div className="card-glow flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
              <Users size={28} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200">No votes cast yet</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              The election is in progress but no votes have been recorded. Head to the Voting Machine to cast votes.
            </p>
            <button onClick={() => navigate('voting')} className="btn-primary">
              <ArrowLeft size={16} /> Go to Voting Machine
            </button>
          </div>
        )}

        {/* ─── Candidate Results Table ─── */}
        {!noVotes && (
          <div className="card-glow overflow-hidden !p-0">
            <div className="px-5 py-4 border-b border-logic-border flex items-center gap-2">
              <Hash size={16} className="text-emerald-400" />
              <h2 className="text-lg font-semibold text-gray-100">Candidate Results</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-logic-border text-xs text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3 font-medium">Rank</th>
                    <th className="px-5 py-3 font-medium">Binary Code</th>
                    <th className="px-5 py-3 font-medium">Symbol</th>
                    <th className="px-5 py-3 font-medium">Candidate</th>
                    <th className="px-5 py-3 font-medium">Party</th>
                    <th className="px-5 py-3 font-medium text-right">Votes</th>
                    <th className="px-5 py-3 font-medium text-right">%</th>
                    <th className="px-5 py-3 font-medium min-w-[140px]">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCandidates.map((candidate, idx) => {
                    const votes = candidate.votes ?? candidate.voteCount ?? 0;
                    const pct = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0';
                    const color = getCandidateColor(candidate, idx);
                    const binaryCode = candidate.binaryCode ?? candidate.code ?? numberToBinary(candidate.id ?? idx, 4);
                    const name = candidate.name || candidate.candidateName || `Candidate ${candidate.id}`;
                    const party = candidate.party || candidate.partyName || '—';
                    const symbol = candidate.symbol || '●';

                    return (
                      <tr
                        key={candidate.id ?? idx}
                        className="border-b border-logic-border/50 hover:bg-slate-800/30 transition-colors"
                        style={{ borderLeftWidth: 3, borderLeftColor: color }}
                      >
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1.5">
                            {idx === 0 && totalVotes > 0 && (
                              <Trophy size={14} className="text-yellow-400" />
                            )}
                            <span className="text-gray-200 font-mono font-semibold">{idx + 1}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex gap-0.5">
                            {String(binaryCode).split('').map((bit, bi) => (
                              <span key={bi} className={`binary-bit ${bit === '1' ? 'high' : 'low'} !w-6 !h-6 text-xs`}>
                                {bit}
                              </span>
                            ))}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xl">{symbol}</td>
                        <td className="px-5 py-3">
                          <span className="text-gray-100 font-medium">{name}</span>
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-sm">{party}</td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-gray-100 font-mono font-bold">{votes}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-slate-300 font-mono text-sm">{pct}%</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: color,
                                boxShadow: `0 0 8px ${color}66`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Charts Row ─── */}
        {!noVotes && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="card-glow">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-gray-200">Vote Counts</h3>
              </div>
              <div className="h-72">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>

            {/* Pie Chart */}
            <div className="card-glow">
              <div className="flex items-center gap-2 mb-4">
                <PieChart size={16} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-gray-200">Vote Distribution</h3>
              </div>
              <div className="h-72 flex items-center justify-center">
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
          </div>
        )}

        {/* ─── Vote Log ─── */}
        {!noVotes && voteLog.length > 0 && (
          <div className="card-glow">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-gray-200">Recent Votes</h3>
              <span className="ml-auto text-xs text-slate-500">Last {Math.min(voteLog.length, 5)} entries</span>
            </div>
            <div className="space-y-2">
              {voteLog.slice(-5).reverse().map((vote, idx) => {
                const voteName = vote.candidateName || vote.name || `Candidate ${vote.candidateId}`;
                const voteTime = vote.timestamp
                  ? new Date(vote.timestamp).toLocaleTimeString()
                  : '—';
                const voteCode = vote.binaryCode || vote.code || '';

                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 px-4 py-2.5 bg-slate-800/40 rounded-lg border border-slate-700/40"
                  >
                    <span className="text-xs text-slate-500 font-mono w-20 shrink-0">{voteTime}</span>
                    {voteCode && (
                      <span className="inline-flex gap-0.5 shrink-0">
                        {String(voteCode).split('').map((bit, bi) => (
                          <span key={bi} className={`binary-bit ${bit === '1' ? 'high' : 'low'} !w-5 !h-5 text-[10px]`}>
                            {bit}
                          </span>
                        ))}
                      </span>
                    )}
                    <span className="text-gray-300 text-sm">{voteName}</span>
                    <div className="ml-auto">
                      <div className="signal-dot high" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Action Buttons ─── */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button onClick={() => navigate('voting')} className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Voting
          </button>
          <button onClick={() => navigate('circuit')} className="btn-secondary flex items-center gap-2">
            <Cpu size={16} />
            View Circuit
          </button>
          <div className="flex-1" />
          <button
            onClick={handleReset}
            disabled={resetting}
            className="btn-danger flex items-center gap-2"
          >
            <RotateCcw size={16} className={resetting ? 'animate-spin' : ''} />
            {resetting ? 'Resetting…' : 'Reset Election'}
          </button>
        </div>
      </div>
    </div>
  );
}
