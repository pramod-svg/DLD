import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Zap, Eye, ChevronRight } from 'lucide-react';
import { evaluateFullCircuit, bcdToSevenSegment } from '../../simulation/dldEngine';
import {
  ANDGate, ORGate, NOTGate, XORGate,
  EncoderBlock, FlipFlopBlock, DecoderBlock, CounterBlock,
  Wire, SignalLabel
} from './CircuitComponents';
import SevenSegmentDisplay from './SevenSegmentDisplay';
import { api } from '../../api/api';

const ANIMATION_STEPS = [
  { id: 0, label: 'Idle', description: 'No input – all signals inactive' },
  { id: 1, label: 'Candidate Selected', description: 'Input button pressed – one-hot input line activated' },
  { id: 2, label: 'Encoder Output', description: 'Priority encoder converts input to 3-bit binary code' },
  { id: 3, label: 'Control Logic Gates', description: 'AND/OR/NOT gates validate the vote signal' },
  { id: 4, label: 'D Flip-Flop Latch', description: 'Clock pulse stores candidate code in register' },
  { id: 5, label: 'Decoder Activation', description: 'Binary code decoded to activate candidate output line' },
  { id: 6, label: 'Counter Increment', description: 'Synchronous counter increments vote count' },
  { id: 7, label: 'Seven-Segment Update', description: 'BCD decoder drives 7-segment display with new total' },
  { id: 8, label: 'Complete', description: 'Vote fully processed and stored' },
];

export default function CircuitVisualization({ navigate, lastVoteSignals, electionState }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [circuitState, setCircuitState] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [counters, setCounters] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const playIntervalRef = useRef(null);

  // Fetch candidates on mount
  useEffect(() => {
    const fetchData = async () => {
      const res = await api.getResults();
      if (res.success) {
        setCandidates(res.candidates || []);
        setTotalVotes(res.totalVotes || 0);
        const cMap = {};
        (res.candidates || []).forEach(c => { cMap[c.candidateId] = c.voteCount; });
        setCounters(cMap);
      }
    };
    fetchData();
  }, []);

  // If we received signals from the VotingMachine, set them up
  useEffect(() => {
    if (lastVoteSignals) {
      setCircuitState(lastVoteSignals);
      setSelectedCandidate(lastVoteSignals.inputs?.candidateId || null);
      setCurrentStep(0);
    }
  }, [lastVoteSignals]);

  // Evaluate circuit when candidate is selected for demo
  const runCircuit = useCallback((candidateId) => {
    setSelectedCandidate(candidateId);
    const result = evaluateFullCircuit({
      candidateId,
      totalCandidates: candidates.length || 4,
      ballotUnitLocked: false,
      enableSignal: true,
      clockPulse: true,
      counters,
      totalVotes
    });
    setCircuitState(result);
    setCurrentStep(1);
  }, [candidates, counters, totalVotes]);

  // Auto-play stepping
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= 8) {
            setIsPlaying(false);
            return 8;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying]);

  const handlePlay = () => {
    if (currentStep >= 8) setCurrentStep(0);
    setIsPlaying(true);
  };
  const handlePause = () => setIsPlaying(false);
  const handlePrev = () => { setIsPlaying(false); setCurrentStep(s => Math.max(0, s - 1)); };
  const handleNext = () => { setIsPlaying(false); setCurrentStep(s => Math.min(8, s + 1)); };
  const handleReset = () => { setIsPlaying(false); setCurrentStep(0); setCircuitState(null); setSelectedCandidate(null); };

  // Derived signal values based on current step visibility
  const cs = circuitState;
  const step = currentStep;
  const inputActive = step >= 1 && cs;
  const encoderActive = step >= 2 && cs;
  const gatesActive = step >= 3 && cs;
  const flipFlopActive = step >= 4 && cs;
  const decoderActive = step >= 5 && cs;
  const counterActive = step >= 6 && cs;
  const displayActive = step >= 7 && cs;

  // Seven segment for total display
  const totalForDisplay = displayActive ? totalVotes + 1 : totalVotes;
  const digitUnits = bcdToSevenSegment(totalForDisplay % 10);
  const digitTens = bcdToSevenSegment(Math.floor((totalForDisplay % 100) / 10));
  const digitHundreds = bcdToSevenSegment(Math.floor(totalForDisplay / 100) % 10);

  // Counter for selected candidate
  const selectedCounterVal = counterActive && selectedCandidate && counters[selectedCandidate] !== undefined
    ? counters[selectedCandidate] + 1
    : (selectedCandidate ? (counters[selectedCandidate] || 0) : 0);

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-400" />
            DLD Circuit Visualization
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Interactive digital logic circuit of the Electronic Voting Machine — watch real signals flow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('voting')} className="btn-secondary text-sm">
            <Eye className="w-4 h-4 inline mr-1" /> Voting Machine
          </button>
          <button onClick={() => navigate('results')} className="btn-secondary text-sm">
            Results
          </button>
        </div>
      </div>

      {/* Candidate Selection (Demo) */}
      <div className="card-glow mb-4">
        <p className="text-xs text-slate-400 mb-2 font-mono">SELECT A CANDIDATE TO SIMULATE CIRCUIT SIGNALS:</p>
        <div className="flex flex-wrap gap-2">
          {(candidates.length > 0 ? candidates : [
            { candidateId: 1, name: 'Alice', symbol: '⚡', color: '#3b82f6', binaryCode: '001' },
            { candidateId: 2, name: 'Bob', symbol: '🛡️', color: '#10b981', binaryCode: '010' },
            { candidateId: 3, name: 'Clara', symbol: '🚀', color: '#8b5cf6', binaryCode: '011' },
            { candidateId: 4, name: 'David', symbol: '🌟', color: '#f59e0b', binaryCode: '100' },
          ]).map(c => (
            <button
              key={c.candidateId}
              onClick={() => runCircuit(c.candidateId)}
              className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium flex items-center gap-2 ${
                selectedCandidate === c.candidateId
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
              }`}
            >
              <span>{c.symbol}</span>
              <span>{c.name}</span>
              <span className="font-mono text-xs text-slate-500">[{c.binaryCode}]</span>
            </button>
          ))}
        </div>
      </div>

      {/* Animation Controls */}
      <div className="card-glow mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Reset">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={handlePrev} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Previous Step" disabled={currentStep <= 0}>
              <SkipBack className="w-4 h-4" />
            </button>
            {isPlaying ? (
              <button onClick={handlePause} className="p-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors" title="Pause">
                <Pause className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={handlePlay} className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors" title="Play Animation" disabled={!cs}>
                <Play className="w-5 h-5" />
              </button>
            )}
            <button onClick={handleNext} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Next Step" disabled={currentStep >= 8}>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Step Progress */}
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              {ANIMATION_STEPS.map((s, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full border transition-all ${
                    i <= currentStep ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-slate-700 border-slate-600'
                  } ${i === currentStep ? 'ring-2 ring-emerald-400/50 ring-offset-1 ring-offset-logic-dark' : ''}`} />
                  {i < ANIMATION_STEPS.length - 1 && (
                    <div className={`w-4 h-0.5 ${i < currentStep ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">Step {currentStep}:</span>{' '}
              {ANIMATION_STEPS[currentStep]?.label} — {ANIMATION_STEPS[currentStep]?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Circuit Diagram */}
      <div className="card-glow overflow-x-auto">
        <svg viewBox="0 0 1200 620" className="w-full min-w-[900px]" style={{ minHeight: '550px' }}>
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(30,41,59,0.3)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1200" height="620" fill="url(#grid)" />

          {/* Title Labels for each stage */}
          <text x="50" y="25" fontSize="11" fill="#94a3b8" fontFamily="Inter, sans-serif" fontWeight="600">① INPUT</text>
          <text x="210" y="25" fontSize="11" fill="#94a3b8" fontFamily="Inter, sans-serif" fontWeight="600">② ENCODER</text>
          <text x="400" y="25" fontSize="11" fill="#94a3b8" fontFamily="Inter, sans-serif" fontWeight="600">③ LOGIC GATES</text>
          <text x="600" y="25" fontSize="11" fill="#94a3b8" fontFamily="Inter, sans-serif" fontWeight="600">④ D FLIP-FLOP</text>
          <text x="770" y="25" fontSize="11" fill="#94a3b8" fontFamily="Inter, sans-serif" fontWeight="600">⑤ DECODER</text>
          <text x="940" y="25" fontSize="11" fill="#94a3b8" fontFamily="Inter, sans-serif" fontWeight="600">⑥ COUNTER</text>

          {/* ========== STAGE 1: INPUT BUTTONS ========== */}
          {[1, 2, 3, 4].map((cid, i) => {
            const isActive = inputActive && selectedCandidate === cid;
            const cand = candidates.find(c => c.candidateId === cid);
            return (
              <g key={cid}>
                {/* Button */}
                <rect x="20" y={50 + i * 55} width="100" height="40" rx="6"
                  fill={isActive ? 'rgba(16,185,129,0.15)' : '#0f172a'}
                  stroke={isActive ? '#10b981' : '#334155'}
                  strokeWidth={isActive ? 2 : 1}
                />
                <text x="70" y={65 + i * 55} fontSize="9" fill={isActive ? '#6ee7b7' : '#94a3b8'} fontFamily="monospace" textAnchor="middle">
                  {cand ? cand.symbol : ['⚡', '🛡️', '🚀', '🌟'][i]} {cand ? cand.name?.split(' ')[0] : ['Alice', 'Bob', 'Clara', 'David'][i]}
                </text>
                <text x="70" y={80 + i * 55} fontSize="8" fill={isActive ? '#34d399' : '#475569'} fontFamily="monospace" textAnchor="middle">
                  D{cid} = {isActive ? '1' : '0'}
                </text>
                {/* LED */}
                <circle cx="125" cy={70 + i * 55} r="4"
                  fill={isActive ? '#10b981' : '#1e293b'}
                  stroke={isActive ? '#34d399' : '#334155'}
                  strokeWidth="1"
                  className={isActive ? 'seg-on' : ''}
                />
                {/* Wire to encoder */}
                <line x1="132" y1={70 + i * 55} x2="188" y2={70 + i * 55}
                  className={isActive ? 'wire-path active' : 'wire-path inactive'}
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* ========== STAGE 2: ENCODER ========== */}
          <EncoderBlock
            x={190}
            y={45}
            inputs={cs ? cs.encoder.inputs : new Array(8).fill(0)}
            outputs={encoderActive ? [cs.encoder.A2, cs.encoder.A1, cs.encoder.A0] : [0, 0, 0]}
            valid={encoderActive ? cs.encoder.V : 0}
            active={encoderActive}
          />

          {/* Wires from encoder to logic gates */}
          {[0, 1, 2].map(i => (
            <line key={`enc-wire-${i}`}
              x1={288} y1={95 + i * 20} x2={380} y2={80 + i * 30}
              className={encoderActive && cs?.encoder ? 'wire-path active' : 'wire-path inactive'}
              strokeWidth="1.5"
            />
          ))}

          {/* ========== STAGE 3: CONTROL LOGIC GATES ========== */}
          {/* AND Gate: SELECTED && ENABLE */}
          <ANDGate
            x={390} y={50}
            inputA={gatesActive && cs ? cs.inputs.selected : 0}
            inputB={gatesActive ? 1 : 0}
            output={gatesActive && cs ? cs.controlGates.selectedAndEnable : 0}
            label="SEL ∧ EN"
            scale={0.9}
          />
          {/* Input labels */}
          <SignalLabel x={340} y={60} text="SEL" value={gatesActive && cs ? cs.inputs.selected : 0} active={gatesActive} />
          <SignalLabel x={340} y={80} text="EN" value={gatesActive ? 1 : 0} active={gatesActive} />

          {/* NOT Gate: NOT LOCKED */}
          <NOTGate
            x={390} y={115}
            input={gatesActive && cs ? (cs.inputs.ballotUnitLocked ? 1 : 0) : 0}
            output={gatesActive && cs ? cs.controlGates.notLocked : 0}
            label="NOT LOCKED"
            scale={0.9}
          />
          <SignalLabel x={340} y={130} text="LCK" value={gatesActive && cs ? (cs.inputs.ballotUnitLocked ? 1 : 0) : 0} active={gatesActive} />

          {/* AND Gate: (SEL&&EN) && !LOCKED = VALID_VOTE */}
          <ANDGate
            x={470} y={80}
            inputA={gatesActive && cs ? cs.controlGates.selectedAndEnable : 0}
            inputB={gatesActive && cs ? cs.controlGates.notLocked : 0}
            output={gatesActive && cs ? cs.controlGates.validVote : 0}
            label="VALID"
            scale={0.9}
          />
          {/* Wires connecting gates */}
          <line x1={430} y1={68} x2={465} y2={92}
            className={gatesActive && cs?.controlGates.selectedAndEnable ? 'wire-path active' : 'wire-path inactive'}
            strokeWidth="1.5"
          />
          <line x1={425} y1={128} x2={465} y2={108}
            className={gatesActive && cs?.controlGates.notLocked ? 'wire-path active' : 'wire-path inactive'}
            strokeWidth="1.5"
          />

          {/* Valid Vote output label */}
          {gatesActive && cs && (
            <g>
              <rect x={518} y={88} width="80" height="18" rx="4"
                fill={cs.controlGates.validVote ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}
                stroke={cs.controlGates.validVote ? '#10b981' : '#ef4444'}
                strokeWidth="1"
              />
              <text x={558} y={100} fontSize="8" fontFamily="monospace" textAnchor="middle"
                fill={cs.controlGates.validVote ? '#6ee7b7' : '#fca5a5'}>
                VALID={cs.controlGates.validVote}
              </text>
            </g>
          )}

          {/* XOR Parity gate */}
          <XORGate
            x={400} y={170}
            inputA={gatesActive && cs ? cs.encoder.A2 : 0}
            inputB={gatesActive && cs ? cs.encoder.A0 : 0}
            output={gatesActive && cs ? cs.controlGates.parityBit : 0}
            label="PARITY"
            scale={0.8}
          />
          <SignalLabel x={340} y={180} text="A2" value={gatesActive && cs ? cs.encoder.A2 : 0} active={gatesActive} />
          <SignalLabel x={340} y={198} text="A0" value={gatesActive && cs ? cs.encoder.A0 : 0} active={gatesActive} />
          <SignalLabel x={445} y={188} text="PAR" value={gatesActive && cs ? cs.controlGates.parityBit : 0} active={gatesActive} />

          {/* Wire from valid vote output to flip-flop clock */}
          <path
            d={`M 520 98 Q 560 98 570 130 L 570 330 Q 570 350 590 350`}
            className={gatesActive && cs?.controlGates.validVote ? 'wire-path active' : 'wire-path inactive'}
            strokeWidth="1.5"
            fill="none"
          />

          {/* ========== STAGE 4: D FLIP-FLOP ========== */}
          <FlipFlopBlock
            x={600}
            y={50}
            D={flipFlopActive && cs ? [cs.encoder.A2, cs.encoder.A1, cs.encoder.A0] : [0, 0, 0]}
            Q={flipFlopActive && cs ? cs.flipFlop.Q : [0, 0, 0]}
            clockEdge={flipFlopActive && cs?.flipFlop.clockTriggered}
            active={flipFlopActive}
          />

          {/* Wires from encoder output to flip-flop D inputs */}
          {[0, 1, 2].map(i => (
            <path key={`ff-wire-${i}`}
              d={`M 288 ${95 + i * 20} Q 450 ${95 + i * 20} 550 ${90 + i * 16} L 588 ${90 + i * 16}`}
              className={encoderActive && cs?.encoder ? 'wire-path active' : 'wire-path inactive'}
              strokeWidth="1"
              fill="none"
            />
          ))}

          {/* Clock label */}
          {flipFlopActive && (
            <g>
              <text x="588" y="140" fontSize="8" fill="#67e8f9" fontFamily="monospace">CLK ↑</text>
              <rect x="605" y="142" width="65" height="14" rx="3"
                fill="rgba(6,182,212,0.15)"
                stroke="#06b6d4"
                strokeWidth="0.5"
              />
              <text x="638" y="152" fontSize="7" fill="#67e8f9" fontFamily="monospace" textAnchor="middle">
                Stored: {cs?.flipFlop.codeString || '000'}
              </text>
            </g>
          )}

          {/* Wires from flip-flop to decoder */}
          {[0, 1, 2].map(i => (
            <line key={`ff-dec-${i}`}
              x1={698} y1={90 + i * 16} x2={758} y2={90 + i * 16}
              className={flipFlopActive && cs?.flipFlop.Q[i] ? 'wire-path active' : 'wire-path inactive'}
              strokeWidth="1.5"
            />
          ))}

          {/* ========== STAGE 5: DECODER ========== */}
          <DecoderBlock
            x={760}
            y={45}
            inputs={decoderActive && cs ? cs.flipFlop.Q : [0, 0, 0]}
            outputs={decoderActive && cs ? cs.decoder.Y : new Array(8).fill(0)}
            activeLine={decoderActive && cs ? cs.decoder.activeLine : null}
            active={decoderActive}
          />

          {/* ========== STAGE 6: COUNTERS ========== */}
          {[1, 2, 3, 4].map((cid, i) => {
            const count = counterActive && selectedCandidate === cid
              ? (counters[cid] || 0) + 1
              : (counters[cid] || 0);
            const binStr = count.toString(2).padStart(4, '0');
            const cand = candidates.find(c => c.candidateId === cid);
            const isActiveCounter = counterActive && selectedCandidate === cid;

            return (
              <g key={`counter-${cid}`}>
                {/* Wire from decoder output to counter */}
                <line
                  x1={860} y1={76 + (cid) * 10} x2={920} y2={50 + i * 65}
                  className={isActiveCounter ? 'wire-path active' : 'wire-path inactive'}
                  strokeWidth="1.5"
                />
                <CounterBlock
                  x={920}
                  y={35 + i * 65}
                  count={count}
                  binaryString={binStr}
                  label={`CNT-${cid} ${cand ? cand.symbol : ''}`}
                  active={isActiveCounter}
                />
              </g>
            );
          })}

          {/* ========== STAGE 7: SEVEN-SEGMENT DISPLAY ========== */}
          <rect x={1050} y={35} width="130" height="250" rx="8"
            fill="#0a0f1a"
            stroke={displayActive ? '#10b981' : '#1e293b'}
            strokeWidth={displayActive ? 2 : 1}
          />
          <text x={1115} y={55} fontSize="10" fill={displayActive ? '#6ee7b7' : '#94a3b8'} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            7-SEGMENT
          </text>
          <text x={1115} y={68} fontSize="8" fill="#475569" fontFamily="monospace" textAnchor="middle">
            TOTAL VOTES
          </text>

          {/* Seven-segment displays rendered as foreignObject */}
          <foreignObject x={1058} y={75} width="120" height="100">
            <div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
              <SevenSegmentDisplay segments={displayActive ? digitHundreds.segments : {}} digit={displayActive ? Math.floor(totalForDisplay / 100) % 10 : 0} />
              <SevenSegmentDisplay segments={displayActive ? digitTens.segments : {}} digit={displayActive ? Math.floor((totalForDisplay % 100) / 10) : 0} />
              <SevenSegmentDisplay segments={displayActive ? digitUnits.segments : {}} digit={displayActive ? totalForDisplay % 10 : 0} />
            </div>
          </foreignObject>

          {/* BCD binary display */}
          <text x={1115} y={195} fontSize="8" fill={displayActive ? '#fbbf24' : '#475569'} fontFamily="monospace" textAnchor="middle">
            BCD: {displayActive ? (totalForDisplay % 10).toString(2).padStart(4, '0') : '0000'}
          </text>

          {/* Wire from counters to display area */}
          <path
            d={`M 1010 ${35 + (selectedCandidate ? (selectedCandidate - 1) : 0) * 65 + 30} L 1040 ${35 + (selectedCandidate ? (selectedCandidate - 1) : 0) * 65 + 30} Q 1050 200 1050 200`}
            className={counterActive ? 'wire-path active' : 'wire-path inactive'}
            strokeWidth="1.5"
            fill="none"
          />

          {/* ========== FORMULA DISPLAY ========== */}
          <rect x={20} y={300} width="560" height="120" rx="8"
            fill="rgba(15,23,42,0.6)"
            stroke="#1e293b"
            strokeWidth="1"
          />
          <text x={30} y={320} fontSize="10" fill="#94a3b8" fontFamily="Inter, sans-serif" fontWeight="600">SIGNAL EQUATIONS</text>

          <text x={30} y={340} fontSize="9" fill="#64748b" fontFamily="monospace">
            <tspan fill="#f472b6">VALID_VOTE</tspan> = SELECTED <tspan fill="#a78bfa">AND</tspan> ENABLE <tspan fill="#a78bfa">AND</tspan> (<tspan fill="#fb923c">NOT</tspan> LOCKED)
          </text>
          <text x={30} y={358} fontSize="9" fill="#64748b" fontFamily="monospace">
            <tspan fill="#f472b6">ENCODER</tspan>: A2 = D4+D5+D6+D7, A1 = D2+D3+D6+D7, A0 = D1+D3+D5+D7
          </text>
          <text x={30} y={376} fontSize="9" fill="#64748b" fontFamily="monospace">
            <tspan fill="#f472b6">FLIP-FLOP</tspan>: Q(n+1) = D  <tspan fill="#67e8f9">[on CLK rising edge]</tspan>
          </text>
          <text x={30} y={394} fontSize="9" fill="#64748b" fontFamily="monospace">
            <tspan fill="#f472b6">COUNTER</tspan>: COUNT(n+1) = COUNT(n) + 1  <tspan fill="#67e8f9">[on valid vote pulse]</tspan>
          </text>
          <text x={30} y={412} fontSize="9" fill="#64748b" fontFamily="monospace">
            <tspan fill="#f472b6">PARITY</tspan>: P = A2 ⊕ A1 ⊕ A0  <tspan fill="#67e8f9">[error detection]</tspan>
          </text>

          {/* ========== LIVE SIGNAL TABLE ========== */}
          <rect x={600} y={300} width="580" height="120" rx="8"
            fill="rgba(15,23,42,0.6)"
            stroke="#1e293b"
            strokeWidth="1"
          />
          <text x={610} y={320} fontSize="10" fill="#94a3b8" fontFamily="Inter, sans-serif" fontWeight="600">LIVE SIGNAL VALUES</text>

          {cs && (
            <g>
              <text x={610} y={340} fontSize="9" fill="#64748b" fontFamily="monospace">
                Input Line: D{selectedCandidate || 0} = <tspan fill={inputActive ? '#6ee7b7' : '#475569'}>{inputActive ? '1' : '0'}</tspan>
                {'   '}Encoder: <tspan fill={encoderActive ? '#6ee7b7' : '#475569'}>{encoderActive ? cs.encoder.codeString : '---'}</tspan>
                {'   '}Valid: <tspan fill={gatesActive ? '#6ee7b7' : '#475569'}>{gatesActive ? cs.controlGates.validVote : '-'}</tspan>
              </text>
              <text x={610} y={358} fontSize="9" fill="#64748b" fontFamily="monospace">
                FF Stored: <tspan fill={flipFlopActive ? '#67e8f9' : '#475569'}>{flipFlopActive ? cs.flipFlop.codeString : '---'}</tspan>
                {'   '}Decoder Active: Y<tspan fill={decoderActive ? '#a5b4fc' : '#475569'}>{decoderActive ? cs.decoder.activeLine : '-'}</tspan>
                {'   '}Parity: <tspan fill={gatesActive ? '#fbbf24' : '#475569'}>{gatesActive ? cs.controlGates.parityBit : '-'}</tspan>
              </text>
              <text x={610} y={376} fontSize="9" fill="#64748b" fontFamily="monospace">
                Counter[{selectedCandidate || '-'}]: <tspan fill={counterActive ? '#fbbf24' : '#475569'}>
                  {counterActive ? selectedCounterVal.toString(2).padStart(4, '0') : '----'}
                </tspan> = <tspan fill={counterActive ? '#fbbf24' : '#475569'}>{counterActive ? selectedCounterVal : '-'}</tspan> votes
              </text>
              <text x={610} y={394} fontSize="9" fill="#64748b" fontFamily="monospace">
                7-Seg BCD: <tspan fill={displayActive ? '#6ee7b7' : '#475569'}>
                  {displayActive ? (totalForDisplay % 10).toString(2).padStart(4, '0') : '----'}
                </tspan>
                {'   '}Display: <tspan fill={displayActive ? '#6ee7b7' : '#475569'}>{displayActive ? totalForDisplay : '-'}</tspan>
              </text>
              <text x={610} y={412} fontSize="9" fill="#64748b" fontFamily="monospace">
                Status: <tspan fill={
                  step >= 8 ? '#6ee7b7' : step >= 1 ? '#fbbf24' : '#475569'
                }>
                  {ANIMATION_STEPS[currentStep]?.label || 'Idle'}
                </tspan>
              </text>
            </g>
          )}

          {!cs && (
            <text x={610} y={345} fontSize="11" fill="#475569" fontFamily="monospace">
              Select a candidate above to see live signals...
            </text>
          )}

          {/* ========== DATA FLOW ARROWS ========== */}
          {/* Stage labels at bottom */}
          {[
            { x: 70, label: 'INPUT' },
            { x: 230, label: 'ENCODE' },
            { x: 450, label: 'VALIDATE' },
            { x: 640, label: 'STORE' },
            { x: 800, label: 'DECODE' },
            { x: 960, label: 'COUNT' },
            { x: 1115, label: 'DISPLAY' },
          ].map((item, i) => (
            <g key={item.label}>
              <rect x={item.x - 30} y={440} width="60" height="20" rx="4"
                fill={step > i ? 'rgba(16,185,129,0.15)' : 'rgba(15,23,42,0.6)'}
                stroke={step > i ? '#10b981' : '#334155'}
                strokeWidth="1"
              />
              <text x={item.x} y={454} fontSize="7" fill={step > i ? '#6ee7b7' : '#64748b'} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                {item.label}
              </text>
              {i < 6 && (
                <line x1={item.x + 32} y1={450} x2={[230, 450, 640, 800, 960, 1115][i] - 32} y2={450}
                  stroke={step > i + 1 ? '#10b981' : '#334155'}
                  strokeWidth="1"
                  markerEnd={step > i + 1 ? '' : ''}
                />
              )}
              {i < 6 && (
                <polygon
                  points={`${[230, 450, 640, 800, 960, 1115][i] - 32},447 ${[230, 450, 640, 800, 960, 1115][i] - 32},453 ${[230, 450, 640, 800, 960, 1115][i] - 26},450`}
                  fill={step > i + 1 ? '#10b981' : '#334155'}
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Step Description Card */}
      <div className="mt-4 card-glow">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
            step >= 8 ? 'bg-emerald-500/20 text-emerald-400' : step > 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
          }`}>
            {currentStep}
          </div>
          <div>
            <h3 className="font-semibold text-white">{ANIMATION_STEPS[currentStep]?.label}</h3>
            <p className="text-sm text-slate-400 mt-0.5">{ANIMATION_STEPS[currentStep]?.description}</p>
            {step === 1 && cs && (
              <p className="text-xs text-emerald-400 mt-1 font-mono">
                Candidate {selectedCandidate} pressed → Input line D{selectedCandidate} = HIGH (1)
              </p>
            )}
            {step === 2 && cs && (
              <p className="text-xs text-emerald-400 mt-1 font-mono">
                Encoder output: A2={cs.encoder.A2} A1={cs.encoder.A1} A0={cs.encoder.A0} → Binary code: {cs.encoder.codeString}
              </p>
            )}
            {step === 3 && cs && (
              <p className="text-xs text-emerald-400 mt-1 font-mono">
                VALID_VOTE = {cs.inputs.selected} AND 1 AND NOT({cs.inputs.ballotUnitLocked ? 1 : 0}) = {cs.controlGates.validVote} → {cs.controlGates.statusText}
              </p>
            )}
            {step === 4 && cs && (
              <p className="text-xs text-cyan-400 mt-1 font-mono">
                CLK ↑ → D Flip-Flop captures D[{cs.encoder.codeString}] → Q = {cs.flipFlop.codeString}
              </p>
            )}
            {step === 5 && cs && (
              <p className="text-xs text-indigo-400 mt-1 font-mono">
                Decoder input [{cs.flipFlop.codeString}] → Output line Y{cs.decoder.activeLine} = HIGH
              </p>
            )}
            {step === 6 && cs && (
              <p className="text-xs text-amber-400 mt-1 font-mono">
                Counter[{selectedCandidate}]: {(counters[selectedCandidate] || 0).toString(2).padStart(4, '0')} → {selectedCounterVal.toString(2).padStart(4, '0')} (decimal: {counters[selectedCandidate] || 0} → {selectedCounterVal})
              </p>
            )}
            {step === 7 && cs && (
              <p className="text-xs text-emerald-400 mt-1 font-mono">
                BCD decoder → 7-Segment shows: {totalForDisplay} (segments a-g activated per truth table)
              </p>
            )}
            {step === 8 && cs && (
              <p className="text-xs text-emerald-400 mt-1 font-mono">
                ✓ Vote registered! Ballot unit locked. Press "Permit" on Control Unit for next voter.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
