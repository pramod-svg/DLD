import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Trash2, Play, RotateCcw, CheckCircle, AlertTriangle, Settings, Hash } from 'lucide-react';
import { api } from '../../api/api.js';

const DEFAULT_CANDIDATES = [
  { name: 'Alice Henderson', party: 'Logic Innovators (LI)', symbol: '⚡', color: '#3b82f6' },
  { name: 'Bob Montgomery', party: 'Binary Vanguard (BV)', symbol: '🛡️', color: '#10b981' },
  { name: 'Clara Oswald', party: 'Silicon Frontier (SF)', symbol: '🚀', color: '#8b5cf6' },
  { name: 'David Zhao', party: 'Quantum Progress (QP)', symbol: '🌟', color: '#f59e0b' },
];

const EMOJI_OPTIONS = ['⚡', '🛡️', '🚀', '🌟', '🔥', '💎', '🎯', '🌊', '⚙️', '🔔', '🦅', '🐉', '🌈', '🏆', '🍀'];

const MAX_CANDIDATES = 7;

function toBinary(index) {
  return (index + 1).toString(2).padStart(3, '0');
}

function BinaryChip({ binary }) {
  return (
    <div className="flex gap-0.5">
      {binary.split('').map((bit, i) => (
        <span key={i} className={`binary-bit ${bit === '1' ? 'high' : 'low'}`}>
          {bit}
        </span>
      ))}
    </div>
  );
}

function CandidateCard({ candidate, index, onRemove, isDefault }) {
  const binary = toBinary(index);

  return (
    <div className="card-glow group relative">
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: candidate.color }}
      />

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={() => onRemove(index)}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-900/30 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800/50"
          title="Remove candidate"
        >
          <Trash2 size={14} />
        </button>
      )}

      <div className="flex items-start gap-4 mt-2">
        {/* Symbol */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl border"
          style={{
            backgroundColor: `${candidate.color}15`,
            borderColor: `${candidate.color}40`,
          }}
        >
          {candidate.symbol}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm truncate">{candidate.name}</h4>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{candidate.party}</p>

          {/* Color swatch */}
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-4 h-4 rounded-full border border-white/20"
              style={{ backgroundColor: candidate.color }}
              title={candidate.color}
            />
            <span className="text-[10px] font-mono text-slate-500 uppercase">{candidate.color}</span>
          </div>
        </div>
      </div>

      {/* Binary code footer */}
      <div className="mt-4 pt-3 border-t border-logic-border flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Binary Code</span>
        <BinaryChip binary={binary} />
      </div>
    </div>
  );
}

export default function ElectionSetup({ navigate, onElectionReady }) {
  // Election configuration
  const [title, setTitle] = useState('Digital Systems Student Election 2026');
  const [description, setDescription] = useState(
    'A demonstration of how Digital Logic Design concepts power Electronic Voting Machines — from button-press encoding to binary storage and result decoding.'
  );

  // Candidate management
  const [candidates, setCandidates] = useState(DEFAULT_CANDIDATES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    party: '',
    symbol: '🔥',
    color: '#ec4899',
  });

  // Status
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [electionCreated, setElectionCreated] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Check existing election on mount
  useEffect(() => {
    (async () => {
      const result = await api.getElection();
      if (result && result.success && result.data) {
        setElectionCreated(true);
      }
    })();
  }, []);

  // Clear messages after timeout
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const addCandidate = useCallback(() => {
    if (!newCandidate.name.trim() || !newCandidate.party.trim()) {
      setError('Candidate name and party/tagline are required.');
      return;
    }
    if (candidates.length >= MAX_CANDIDATES) {
      setError('Maximum 7 candidates allowed (3-bit encoding limit).');
      return;
    }
    setCandidates((prev) => [...prev, { ...newCandidate, name: newCandidate.name.trim(), party: newCandidate.party.trim() }]);
    setNewCandidate({ name: '', party: '', symbol: '🔥', color: '#ec4899' });
    setShowAddForm(false);
    setSuccessMsg('Candidate added successfully.');
  }, [newCandidate, candidates.length]);

  const removeCandidate = useCallback(
    (index) => {
      if (candidates.length <= 2) {
        setError('At least 2 candidates are required.');
        return;
      }
      setCandidates((prev) => prev.filter((_, i) => i !== index));
    },
    [candidates.length]
  );

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Election title is required.');
      return;
    }
    if (candidates.length < 2) {
      setError('At least 2 candidates are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        candidates: candidates.map((c, i) => ({
          name: c.name,
          partyOrTagline: c.party || c.partyOrTagline,
          symbol: c.symbol,
          color: c.color,
          binaryCode: toBinary(i),
        })),
      };

      const result = await api.createElection(body);

      if (result && result.success !== false) {
        setElectionCreated(true);
        setSuccessMsg('Election created successfully! Redirecting to voting...');
        if (onElectionReady) {
          onElectionReady(result);
        }
        setTimeout(() => navigate('voting'), 1200);
      } else {
        setError(result?.error || 'Failed to create election. Please try again.');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    setError(null);

    try {
      const result = await api.resetElection();
      if (result && result.success !== false) {
        setElectionCreated(false);
        setCandidates(DEFAULT_CANDIDATES);
        setTitle('Digital Systems Student Election 2026');
        setDescription(
          'A demonstration of how Digital Logic Design concepts power Electronic Voting Machines — from button-press encoding to binary storage and result decoding.'
        );
        setSuccessMsg('Simulation reset successfully.');
      } else {
        setError(result?.error || 'Failed to reset simulation.');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Settings size={22} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Election Setup</h1>
            <p className="text-slate-400 text-sm">Control Unit Configuration</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm mt-3 max-w-2xl">
          Configure the election parameters and candidate roster. Each candidate is assigned a unique 3-bit binary code
          used by the priority encoder during vote capture.
        </p>
      </div>

      {/* Status Bar */}
      <div className="card-glow mb-6">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`led-indicator ${electionCreated ? 'on' : 'off'}`} />
            <span className={electionCreated ? 'text-emerald-400' : 'text-slate-500'}>
              {electionCreated ? 'Election Active' : 'Not Configured'}
            </span>
          </div>
          <div className="w-px h-5 bg-logic-border" />
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <span className="text-slate-300">
              {candidates.length} Candidate{candidates.length !== 1 ? 's' : ''}
            </span>
            <span className="text-slate-600 text-xs">/ {MAX_CANDIDATES} max</span>
          </div>
          <div className="w-px h-5 bg-logic-border" />
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-slate-400" />
            <span className="text-slate-300">3-bit Encoding</span>
            <span className="text-slate-600 text-xs">(000–111)</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800/40 flex items-center gap-2 text-red-400 text-sm">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/40 flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Election Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-glow">
            <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
              <Settings size={16} className="text-emerald-400" />
              Election Configuration
            </h2>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Election Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-logic-dark border border-logic-border rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                placeholder="Enter election title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 bg-logic-dark border border-logic-border rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors resize-none"
                placeholder="Describe the election purpose"
              />
            </div>
          </div>

          {/* Encoding Reference */}
          <div className="card-glow">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Hash size={14} className="text-logic-clock" />
              Binary Encoding Map
            </h3>
            <div className="space-y-2">
              {candidates.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 px-2 rounded bg-logic-dark/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0">{c.symbol}</span>
                    <span className="text-xs text-slate-300 truncate">{c.name}</span>
                  </div>
                  <BinaryChip binary={toBinary(i)} />
                </div>
              ))}
              {candidates.length === 0 && (
                <p className="text-xs text-slate-600 text-center py-3">No candidates added</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column — Candidate Management */}
        <div className="lg:col-span-2">
          <div className="card-glow">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-base flex items-center gap-2">
                <Users size={16} className="text-emerald-400" />
                Candidate Roster
              </h2>
              <button
                onClick={() => setShowAddForm((v) => !v)}
                disabled={candidates.length >= MAX_CANDIDATES}
                className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={14} />
                Add Candidate
              </button>
            </div>

            {/* Add Candidate Form */}
            {showAddForm && (
              <div className="mb-5 p-4 rounded-lg bg-logic-dark border border-logic-border">
                <h3 className="text-sm font-medium text-slate-300 mb-3">New Candidate</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1 uppercase tracking-wider">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-logic-panel border border-logic-border rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                      placeholder="Candidate name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1 uppercase tracking-wider">
                      Party / Tagline
                    </label>
                    <input
                      type="text"
                      value={newCandidate.party}
                      onChange={(e) => setNewCandidate((p) => ({ ...p, party: e.target.value }))}
                      className="w-full px-3 py-2 bg-logic-panel border border-logic-border rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                      placeholder="Party name or tagline"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1 uppercase tracking-wider">
                      Symbol
                    </label>
                    <select
                      value={newCandidate.symbol}
                      onChange={(e) => setNewCandidate((p) => ({ ...p, symbol: e.target.value }))}
                      className="w-full px-3 py-2 bg-logic-panel border border-logic-border rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
                    >
                      {EMOJI_OPTIONS.map((emoji) => (
                        <option key={emoji} value={emoji}>
                          {emoji}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1 uppercase tracking-wider">
                      Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newCandidate.color}
                        onChange={(e) => setNewCandidate((p) => ({ ...p, color: e.target.value }))}
                        className="w-10 h-9 rounded border border-logic-border cursor-pointer bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-500">{newCandidate.color}</span>
                    </div>
                  </div>
                </div>

                {/* Preview of new candidate binary */}
                <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                  <span>Will be assigned binary code:</span>
                  <BinaryChip binary={toBinary(candidates.length)} />
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={addCandidate} className="btn-primary text-sm">
                    <Plus size={14} />
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Capacity warning */}
            {candidates.length >= MAX_CANDIDATES && (
              <div className="mb-4 p-2.5 rounded-lg bg-logic-warning/10 border border-logic-warning/20 flex items-center gap-2 text-logic-warning text-xs">
                <AlertTriangle size={14} />
                Maximum capacity reached — 3-bit encoding supports up to 7 candidates (001–111).
              </div>
            )}

            {/* Candidate Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidates.map((candidate, i) => (
                <CandidateCard
                  key={`${candidate.name}-${i}`}
                  candidate={candidate}
                  index={i}
                  onRemove={removeCandidate}
                  isDefault={i < DEFAULT_CANDIDATES.length}
                />
              ))}
            </div>

            {candidates.length === 0 && (
              <div className="text-center py-12 text-slate-600">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No candidates added yet. Add at least 2 to proceed.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 card-glow">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={loading || candidates.length < 2 || !title.trim()}
              className="btn-primary text-base"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Create &amp; Start Election
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={resetting}
              className="btn-danger flex items-center gap-2"
            >
              {resetting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw size={16} />
                  Reset Simulation
                </>
              )}
            </button>
          </div>

          {/* Quick status */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle
                size={14}
                className={title.trim() ? 'text-emerald-500' : 'text-slate-700'}
              />
              <span className={title.trim() ? 'text-slate-300' : ''}>Title set</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle
                size={14}
                className={candidates.length >= 2 ? 'text-emerald-500' : 'text-slate-700'}
              />
              <span className={candidates.length >= 2 ? 'text-slate-300' : ''}>
                ≥2 Candidates
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle
                size={14}
                className={electionCreated ? 'text-emerald-500' : 'text-slate-700'}
              />
              <span className={electionCreated ? 'text-slate-300' : ''}>Created</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
