import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Vote,
  RotateCcw,
  Eye,
  Cpu,
} from 'lucide-react';
import { api } from '../../api/api.js';
import {
  evaluateFullCircuit,
  numberTo4BitCounter,
  bcdToSevenSegment,
} from '../../simulation/dldEngine.js';

/* ─── tiny helpers ─── */
const toBinary = (n, bits = 3) => n.toString(2).padStart(bits, '0');

const CANDIDATE_COLORS = [
  'border-l-orange-500',
  'border-l-blue-500',
  'border-l-green-500',
  'border-l-rose-500',
  'border-l-yellow-500',
  'border-l-purple-500',
  'border-l-cyan-500',
];
const CANDIDATE_BG_SELECTED = [
  'bg-orange-500/10',
  'bg-blue-500/10',
  'bg-green-500/10',
  'bg-rose-500/10',
  'bg-yellow-500/10',
  'bg-purple-500/10',
  'bg-cyan-500/10',
];

/* ─── Screw decoration for corners ─── */
function Screw({ className = '' }) {
  return (
    <div
      className={`absolute w-4 h-4 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center ${className}`}
    >
      <div className="w-2 h-0.5 bg-slate-500 rotate-45" />
    </div>
  );
}

/* ─── Seven-Segment Display (mini) ─── */
function MiniSevenSeg({ digit = 0, size = 28 }) {
  const segs = bcdToSevenSegment(digit);
  const s = segs.segments;
  const on = 'stroke-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.8)]';
  const off = 'stroke-slate-700';
  const sw = 2.5;
  return (
    <svg
      width={size}
      height={size * 1.7}
      viewBox="0 0 30 50"
      className="inline-block"
    >
      {/* a */ }
      <line x1="7" y1="3" x2="23" y2="3" strokeWidth={sw} className={s.a ? on : off} strokeLinecap="round" />
      {/* b */ }
      <line x1="24" y1="5" x2="24" y2="23" strokeWidth={sw} className={s.b ? on : off} strokeLinecap="round" />
      {/* c */ }
      <line x1="24" y1="27" x2="24" y2="45" strokeWidth={sw} className={s.c ? on : off} strokeLinecap="round" />
      {/* d */ }
      <line x1="7" y1="47" x2="23" y2="47" strokeWidth={sw} className={s.d ? on : off} strokeLinecap="round" />
      {/* e */ }
      <line x1="6" y1="27" x2="6" y2="45" strokeWidth={sw} className={s.e ? on : off} strokeLinecap="round" />
      {/* f */ }
      <line x1="6" y1="5" x2="6" y2="23" strokeWidth={sw} className={s.f ? on : off} strokeLinecap="round" />
      {/* g */ }
      <line x1="7" y1="25" x2="23" y2="25" strokeWidth={sw} className={s.g ? on : off} strokeLinecap="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function VotingMachine({
  navigate,
  electionState,
  setElectionState,
  onVoteCast,
}) {
  /* ── state ── */
  const [candidates, setCandidates] = useState([]);
  const [election, setElection] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [ballotLocked, setBallotLocked] = useState(true);
  const [voterSession, setVoterSession] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [counters, setCounters] = useState({});
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flashVote, setFlashVote] = useState(false);
  const [castingVote, setCastingVote] = useState(false);

  const confirmTimerRef = useRef(null);

  /* ── fetch data on mount ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [elRes, candRes] = await Promise.all([
        api.getElection(),
        api.getCandidates(),
      ]);

      if (!elRes.success && elRes.error) {
        setElection(null);
        setLoading(false);
        return;
      }
      // API returns { success, data: electionObj }
      const elData = elRes.data || elRes.election || elRes;
      if (elData && elData.title) {
        setElection(elData);
        setTotalVotes(elData.totalVotes || 0);
        setBallotLocked(elData.ballotUnitLocked !== false);
        setVoterSession(elData.currentVoterSessionId || null);
      } else {
        setElection(null);
      }

      // API returns { success, data: [...candidates], count }
      const candData = candRes.data || candRes.candidates || candRes;
      if (Array.isArray(candData)) {
        setCandidates(candData);
        const cMap = {};
        candData.forEach(c => { cMap[c.candidateId] = c.voteCount || 0; });
        setCounters(cMap);
      }
    } catch {
      setError('Failed to load election data.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, [fetchData]);

  /* ── Permit balloting (officer action) ── */
  const handlePermit = async () => {
    setError(null);
    setConfirmation(null);
    setSelectedId(null);
    const res = await api.permitNextVoter();
    if (res.success === false) {
      setError(res.error || 'Unable to permit next voter.');
      return;
    }
    const electionData = res.election || {};
    const sessionId = electionData.currentVoterSessionId || res.voterSessionId || res.sessionId || `SESSION-${String((totalVotes + 1)).padStart(4, '0')}`;
    setVoterSession(sessionId);
    setBallotLocked(false);
  };

  /* ── Cast vote ── */
  const handleCastVote = async () => {
    if (!selectedId || ballotLocked || castingVote) return;
    setCastingVote(true);
    setError(null);

    const res = await api.castVote({ candidateId: selectedId });
    if (res.success === false) {
      setError(res.error || 'Vote failed. Possible duplicate or locked ballot.');
      setCastingVote(false);
      return;
    }

    /* run DLD circuit locally */
    const candidate = candidates.find((c) => (c.candidateId || c.id) === selectedId);
    const candidateIndex = candidate ? (candidate.candidateId || candidate.id || candidates.indexOf(candidate) + 1) : selectedId;
    const newCounters = { ...counters };
    newCounters[selectedId] = (newCounters[selectedId] || 0) + 1;
    const newTotal = totalVotes + 1;

    const circuitData = evaluateFullCircuit({
      candidateId: candidateIndex,
      totalCandidates: candidates.length,
      ballotUnitLocked: false,
      enableSignal: true,
      clockPulse: true,
      counters: newCounters,
      totalVotes: newTotal,
    });

    setCounters(newCounters);
    setTotalVotes(newTotal);

    /* pass to parent for circuit visualization */
    if (onVoteCast) {
      onVoteCast({
        ...circuitData,
        candidateName: candidate?.name || `Candidate ${selectedId}`,
        candidateId: selectedId,
        dldSignals: res.dldSignals || null,
      });
    }

    /* lock and show confirmation */
    setBallotLocked(true);
    setFlashVote(true);
    setConfirmation({
      name: candidate?.name || `Candidate ${selectedId}`,
      binary: toBinary(candidateIndex),
      symbol: candidate?.symbol || '✓',
    });

    setTimeout(() => setFlashVote(false), 800);
    confirmTimerRef.current = setTimeout(() => setConfirmation(null), 5000);
    setCastingVote(false);
  };

  /* ── Reset election ── */
  const handleReset = async () => {
    const res = await api.resetElection();
    if (res.success === false) {
      setError(res.error || 'Reset failed.');
      return;
    }
    setBallotLocked(true);
    setSelectedId(null);
    setVoterSession(null);
    setTotalVotes(0);
    setCounters({});
    setConfirmation(null);
    setError(null);
    setElection(null);
    if (setElectionState) setElectionState(null);
    await fetchData();
  };

  /* ── Seven-segment digits for total votes ── */
  const totalClamped = totalVotes % 1000;
  const dH = Math.floor(totalClamped / 100);
  const dT = Math.floor((totalClamped % 100) / 10);
  const dU = totalClamped % 10;

  /* ── Encoder output for status bar ── */
  const selectedCandidate = candidates.find((c) => c.id === selectedId);
  const selectedIndex = selectedCandidate ? selectedCandidate.id : 0;
  const selectedBinary = selectedId ? toBinary(selectedIndex) : '---';
  const encoderOut = selectedId ? toBinary(selectedIndex) : '---';
  const validSignal = selectedId && !ballotLocked ? 1 : 0;

  /* ═══ NO ELECTION STATE ═══ */
  if (!loading && !election) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="card-glow text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-logic-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            No Election Configured
          </h2>
          <p className="text-slate-400 mb-6">
            Please set up an election before using the Voting Machine.
          </p>
          <button
            onClick={() => navigate('setup')}
            className="btn-primary mx-auto"
          >
            <Cpu className="w-4 h-4" />
            Go to Election Setup
          </button>
        </div>
      </div>
    );
  }

  /* ═══ MAIN RENDER ═══ */
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Vote className="w-7 h-7 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">
            Electronic Voting Machine
          </h1>
        </div>
        <span className="text-xs font-mono text-slate-500 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700">
          DLD Simulation • Digital Logic Voting System
        </span>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/40 text-red-400 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Confirmation flash ── */}
      {confirmation && (
        <div
          className={`flex items-center gap-3 bg-emerald-900/30 border border-emerald-600/40 text-emerald-300 rounded-lg px-4 py-3 text-sm transition-all duration-300 ${
            flashVote ? 'animate-pulse ring-2 ring-emerald-400/60' : ''
          }`}
        >
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>
            <strong>Vote Recorded!</strong> {confirmation.name} — Binary:{' '}
            <span className="font-mono text-emerald-200">
              {confirmation.binary}
            </span>{' '}
            {confirmation.symbol}
          </span>
        </div>
      )}

      {/* ═══ EVM HOUSING ═══ */}
      <div className="relative bg-logic-panel border-2 border-logic-border rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
        {/* Screws */}
        <Screw className="top-3 left-3" />
        <Screw className="top-3 right-3" />
        <Screw className="bottom-3 left-3" />
        <Screw className="bottom-3 right-3" />

        {/* Top label strip */}
        <div className="bg-slate-800/70 border-b border-logic-border px-6 py-2 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
            Election Commission of India — EVM Simulator
          </span>
          <span className="text-[10px] font-mono text-slate-600">
            Model: DLD-EVM-2024
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-logic-border">
          {/* ═══════════════════════════════
              LEFT SIDE — CONTROL UNIT (2 cols)
              ═══════════════════════════════ */}
          <div className="lg:col-span-2 p-5 space-y-5">
            {/* Title */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-5 bg-emerald-500 rounded-sm" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                CONTROL UNIT
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 -mt-3">
              Presiding Officer&apos;s Panel
            </p>

            {/* Election info */}
            <div className="gate-box space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Election Title
              </p>
              <p className="text-white font-semibold">
                {election?.title || election?.name || 'Untitled Election'}
              </p>
              {election?.status && (
                <span
                  className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    election.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {election.status.toUpperCase()}
                </span>
              )}
            </div>

            {/* Session ID */}
            <div className="gate-box">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                Voter Session ID
              </p>
              <p className="font-mono text-sm text-cyan-300">
                {voterSession || '—— NONE ——'}
              </p>
            </div>

            {/* READY LED */}
            <div className="flex items-center gap-3 gate-box">
              <div
                className={`led-indicator ${
                  !ballotLocked ? 'on' : 'off'
                }`}
              />
              <span
                className={`text-sm font-semibold ${
                  !ballotLocked ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {!ballotLocked ? 'READY' : 'LOCKED'}
              </span>
              {!ballotLocked ? (
                <Unlock className="w-4 h-4 text-emerald-400 ml-auto" />
              ) : (
                <Lock className="w-4 h-4 text-red-400 ml-auto" />
              )}
            </div>

            {/* Permit Balloting */}
            <button
              onClick={handlePermit}
              disabled={!ballotLocked}
              className="btn-primary w-full justify-center"
            >
              <Unlock className="w-4 h-4" />
              Permit Balloting
            </button>

            {/* Total Votes Counter with 7-seg display */}
            <div className="gate-box">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
                Total Votes Cast
              </p>
              <div className="flex items-center gap-2 justify-center py-2 bg-logic-dark rounded-lg border border-logic-border">
                <MiniSevenSeg digit={dH} size={22} />
                <MiniSevenSeg digit={dT} size={22} />
                <MiniSevenSeg digit={dU} size={22} />
              </div>
              <p className="text-center text-xs text-slate-500 mt-1 font-mono">
                {String(totalVotes).padStart(3, '0')} votes
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('results')}
                className="btn-secondary flex items-center gap-2 justify-center text-sm"
              >
                <Eye className="w-4 h-4" />
                View Results
              </button>
              <button
                onClick={() => navigate('circuit')}
                className="btn-secondary flex items-center gap-2 justify-center text-sm"
              >
                <Cpu className="w-4 h-4" />
                View Circuit
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="btn-danger flex items-center gap-2 justify-center text-xs w-full"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Election
            </button>
          </div>

          {/* ═══════════════════════════════
              RIGHT SIDE — BALLOT UNIT (3 cols)
              ═══════════════════════════════ */}
          <div className="lg:col-span-3 p-5 relative">
            {/* Locked overlay */}
            {ballotLocked && (
              <div className="absolute inset-0 bg-logic-dark/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-r-2xl">
                <Lock className="w-12 h-12 text-red-400 mb-3" />
                <p className="text-red-400 font-bold text-lg">
                  BALLOT UNIT LOCKED
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Officer must permit balloting to proceed
                </p>
              </div>
            )}

            {/* Title */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-5 bg-cyan-500 rounded-sm" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                BALLOT UNIT
              </h2>
              <span className="text-xs text-slate-500 ml-1">
                — Candidate List
              </span>
            </div>

            {/* Candidate list */}
            <div className="space-y-2 mb-5">
              {candidates.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-8">
                  No candidates registered.
                </p>
              )}
              {candidates.map((cand, idx) => {
                const candId = cand.id ?? idx + 1;
                const isSelected = selectedId === candId;
                const colorIdx = idx % CANDIDATE_COLORS.length;
                return (
                  <button
                    key={candId}
                    onClick={() => {
                      if (!ballotLocked) setSelectedId(candId);
                    }}
                    disabled={ballotLocked}
                    className={`evm-button w-full border-l-4 ${
                      CANDIDATE_COLORS[colorIdx]
                    } ${
                      isSelected
                        ? `selected ${CANDIDATE_BG_SELECTED[colorIdx]}`
                        : 'border-slate-700'
                    } ${ballotLocked ? 'locked' : ''}`}
                  >
                    {/* Blue LED */}
                    <div
                      className={`w-4 h-4 rounded-full shrink-0 border-2 transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-400 border-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.7)]'
                          : 'bg-slate-700 border-slate-600'
                      }`}
                    />

                    {/* Number & binary */}
                    <div className="flex flex-col items-center min-w-[3rem]">
                      <span className="text-white font-bold text-sm">
                        #{candId}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {toBinary(candId)}
                      </span>
                    </div>

                    {/* Name & party */}
                    <div className="flex-1 text-left">
                      <p className="text-white font-semibold text-sm">
                        {cand.name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {cand.party || cand.tagline || ''}
                      </p>
                    </div>

                    {/* Symbol */}
                    <span className="text-2xl shrink-0" role="img" aria-label={cand.name}>
                      {cand.symbol || '🔵'}
                    </span>

                    {/* Selected check */}
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* CAST VOTE button */}
            <button
              onClick={handleCastVote}
              disabled={!selectedId || ballotLocked || castingVote}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                selectedId && !ballotLocked && !castingVote
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 hover:shadow-emerald-800/50 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              } ${flashVote ? 'clock-pulse' : ''}`}
            >
              <Vote className="w-6 h-6" />
              {castingVote ? 'RECORDING VOTE…' : 'CAST VOTE'}
            </button>
          </div>
        </div>

        {/* ═══ STATUS BAR ═══ */}
        <div className="bg-slate-900/80 border-t border-logic-border px-6 py-2.5 flex flex-wrap items-center gap-6 text-xs font-mono">
          {/* Binary code */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">SEL BIN:</span>
            <div className="flex gap-1">
              {(selectedId ? toBinary(selectedIndex) : '000')
                .split('')
                .map((bit, i) => (
                  <span
                    key={i}
                    className={`binary-bit ${
                      bit === '1' ? 'high' : 'low'
                    }`}
                  >
                    {bit}
                  </span>
                ))}
            </div>
          </div>

          {/* Encoder output */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">ENC OUT:</span>
            <span className="text-cyan-300">{encoderOut}</span>
          </div>

          {/* Valid vote */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">VALID:</span>
            <span
              className={`signal-dot ${
                validSignal ? 'high' : 'low'
              }`}
            />
            <span
              className={
                validSignal ? 'text-emerald-400' : 'text-slate-500'
              }
            >
              {validSignal ? '1' : '0'}
            </span>
          </div>

          {/* Ballot state */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-500">BALLOT:</span>
            {ballotLocked ? (
              <span className="text-red-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> LOCKED
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <Unlock className="w-3 h-3" /> UNLOCKED
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
