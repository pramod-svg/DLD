import React, { useState, useCallback } from 'react';
import { BookOpen, Cpu, Binary, Clock, Hash, HardDrive, Monitor, ArrowLeft, Zap, Info } from 'lucide-react';
import { AND, OR, NOT, XOR } from '../../simulation/dldEngine.js';

/* ───────────── helpers ───────────── */
const Bit = ({ value }) => (
  <span className={`binary-bit ${value ? 'high' : 'low'}`}>{value ? '1' : '0'}</span>
);

const RoleBox = ({ children }) => (
  <div className="mt-6 border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-4">
    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
      <Zap size={16} /> Role in Voting Machine
    </div>
    <p className="text-slate-300 text-sm leading-relaxed">{children}</p>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="card-glow mb-6">
    {title && <h3 className="text-lg font-bold text-white mb-4">{title}</h3>}
    {children}
  </div>
);

/* ──────────────────────────────────────────────
   TAB 1 — Logic Gates
   ────────────────────────────────────────────── */
const LogicGatesTab = () => {
  const [inputA, setInputA] = useState(0);
  const [inputB, setInputB] = useState(0);

  const toggle = (setter) => setter(v => (v ? 0 : 1));

  const gates = [
    { name: 'AND', fn: AND, symbol: '&', desc: 'Output is 1 only when ALL inputs are 1.' },
    { name: 'OR', fn: OR, symbol: '≥1', desc: 'Output is 1 when ANY input is 1.' },
    { name: 'XOR', fn: XOR, symbol: '=1', desc: 'Output is 1 when inputs DIFFER.' },
  ];

  const GateSVG = ({ name, symbol, output, a, b }) => {
    const outColor = output ? '#10b981' : '#475569';
    const aColor = a ? '#10b981' : '#475569';
    const bColor = b ? '#10b981' : '#475569';

    if (name === 'AND') {
      return (
        <svg viewBox="0 0 180 100" className="w-full h-24">
          {/* Input wires */}
          <line x1="0" y1="30" x2="40" y2="30" stroke={aColor} strokeWidth="2" />
          <line x1="0" y1="70" x2="40" y2="70" stroke={bColor} strokeWidth="2" />
          {/* AND gate body – flat left + curved right */}
          <path d="M40,10 L40,90 L90,90 Q140,90 140,50 Q140,10 90,10 Z"
            fill="none" stroke="#94a3b8" strokeWidth="2" />
          <text x="80" y="55" textAnchor="middle" fill="#94a3b8" fontSize="14" fontFamily="monospace">&amp;</text>
          {/* Output wire */}
          <line x1="140" y1="50" x2="180" y2="50" stroke={outColor} strokeWidth="2" />
          {/* dots */}
          <circle cx="0" cy="30" r="4" fill={aColor} />
          <circle cx="0" cy="70" r="4" fill={bColor} />
          <circle cx="180" cy="50" r="5" fill={outColor} />
          {/* labels */}
          <text x="8" y="24" fill="#94a3b8" fontSize="10">A</text>
          <text x="8" y="64" fill="#94a3b8" fontSize="10">B</text>
          <text x="155" y="44" fill="#94a3b8" fontSize="10">Out</text>
        </svg>
      );
    }
    if (name === 'OR') {
      return (
        <svg viewBox="0 0 180 100" className="w-full h-24">
          <line x1="0" y1="30" x2="50" y2="30" stroke={aColor} strokeWidth="2" />
          <line x1="0" y1="70" x2="50" y2="70" stroke={bColor} strokeWidth="2" />
          {/* OR gate body */}
          <path d="M40,10 Q60,50 40,90 Q90,90 120,90 Q150,70 150,50 Q150,30 120,10 Q90,10 40,10 Z"
            fill="none" stroke="#94a3b8" strokeWidth="2" />
          <text x="90" y="55" textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="monospace">≥1</text>
          <line x1="150" y1="50" x2="180" y2="50" stroke={outColor} strokeWidth="2" />
          <circle cx="0" cy="30" r="4" fill={aColor} />
          <circle cx="0" cy="70" r="4" fill={bColor} />
          <circle cx="180" cy="50" r="5" fill={outColor} />
          <text x="8" y="24" fill="#94a3b8" fontSize="10">A</text>
          <text x="8" y="64" fill="#94a3b8" fontSize="10">B</text>
          <text x="155" y="44" fill="#94a3b8" fontSize="10">Out</text>
        </svg>
      );
    }
    /* XOR */
    return (
      <svg viewBox="0 0 180 100" className="w-full h-24">
        <line x1="0" y1="30" x2="50" y2="30" stroke={aColor} strokeWidth="2" />
        <line x1="0" y1="70" x2="50" y2="70" stroke={bColor} strokeWidth="2" />
        {/* XOR gate body (OR + extra curve) */}
        <path d="M35,10 Q55,50 35,90" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <path d="M40,10 Q60,50 40,90 Q90,90 120,90 Q150,70 150,50 Q150,30 120,10 Q90,10 40,10 Z"
          fill="none" stroke="#94a3b8" strokeWidth="2" />
        <text x="90" y="55" textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="monospace">=1</text>
        <line x1="150" y1="50" x2="180" y2="50" stroke={outColor} strokeWidth="2" />
        <circle cx="0" cy="30" r="4" fill={aColor} />
        <circle cx="0" cy="70" r="4" fill={bColor} />
        <circle cx="180" cy="50" r="5" fill={outColor} />
        <text x="8" y="24" fill="#94a3b8" fontSize="10">A</text>
        <text x="8" y="64" fill="#94a3b8" fontSize="10">B</text>
        <text x="155" y="44" fill="#94a3b8" fontSize="10">Out</text>
      </svg>
    );
  };

  const NotSVG = ({ input }) => {
    const inC = input ? '#10b981' : '#475569';
    const outC = NOT(input) ? '#10b981' : '#475569';
    return (
      <svg viewBox="0 0 180 100" className="w-full h-24">
        <line x1="0" y1="50" x2="50" y2="50" stroke={inC} strokeWidth="2" />
        <polygon points="50,20 130,50 50,80" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <circle cx="136" cy="50" r="6" fill="none" stroke="#94a3b8" strokeWidth="2" />
        <line x1="142" y1="50" x2="180" y2="50" stroke={outC} strokeWidth="2" />
        <circle cx="0" cy="50" r="4" fill={inC} />
        <circle cx="180" cy="50" r="5" fill={outC} />
        <text x="8" y="44" fill="#94a3b8" fontSize="10">A</text>
        <text x="155" y="44" fill="#94a3b8" fontSize="10">Out</text>
      </svg>
    );
  };

  const truthRows = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="What are Logic Gates?">
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          Logic gates are the fundamental building blocks of digital circuits. They take binary inputs (0 or 1) and produce
          a binary output based on a Boolean function. Every digital system — from a simple calculator to an electronic
          voting machine — is constructed using combinations of these basic gates.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          The four primary gates used in our voting machine are <span className="text-emerald-400 font-semibold">AND</span>,{' '}
          <span className="text-emerald-400 font-semibold">OR</span>,{' '}
          <span className="text-emerald-400 font-semibold">NOT</span>, and{' '}
          <span className="text-emerald-400 font-semibold">XOR</span>.
        </p>
      </SectionCard>

      {/* Interactive toggle */}
      <SectionCard title="Interactive Gate Explorer">
        <p className="text-slate-400 text-xs mb-4">Click inputs to toggle between 0 and 1 and see each gate's output change in real time.</p>
        <div className="flex items-center gap-6 mb-6 flex-wrap">
          <button onClick={() => toggle(setInputA)} className="flex items-center gap-2 btn-secondary">
            Input A: <Bit value={inputA} />
          </button>
          <button onClick={() => toggle(setInputB)} className="flex items-center gap-2 btn-secondary">
            Input B: <Bit value={inputB} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gates.map(g => (
            <div key={g.name} className="gate-box active">
              <div className="flex justify-between items-center mb-2">
                <span className="text-emerald-400 font-bold text-sm">{g.name} Gate</span>
                <span className="text-xs text-slate-500">{g.desc}</span>
              </div>
              <GateSVG name={g.name} symbol={g.symbol} output={g.fn(inputA, inputB)} a={inputA} b={inputB} />
              <div className="text-center mt-1 text-sm">
                Output: <Bit value={g.fn(inputA, inputB)} />
              </div>
            </div>
          ))}
          <div className="gate-box active">
            <div className="flex justify-between items-center mb-2">
              <span className="text-emerald-400 font-bold text-sm">NOT Gate</span>
              <span className="text-xs text-slate-500">Output is the inverse of the input.</span>
            </div>
            <NotSVG input={inputA} />
            <div className="text-center mt-1 text-sm">
              NOT A = <Bit value={NOT(inputA)} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Truth Tables */}
      <SectionCard title="Truth Tables">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'AND', fn: AND },
            { name: 'OR', fn: OR },
            { name: 'XOR', fn: XOR },
          ].map(g => (
            <div key={g.name} className="overflow-hidden rounded-lg border border-logic-border">
              <div className="bg-slate-800/60 px-3 py-2 text-center text-emerald-400 font-bold text-sm">{g.name}</div>
              <table className="w-full text-center text-sm">
                <thead>
                  <tr className="border-b border-logic-border bg-slate-800/30">
                    <th className="py-1.5 text-slate-400">A</th>
                    <th className="py-1.5 text-slate-400">B</th>
                    <th className="py-1.5 text-slate-400">Out</th>
                  </tr>
                </thead>
                <tbody>
                  {truthRows.map(([a, b], i) => (
                    <tr key={i} className="border-b border-logic-border/50">
                      <td className="py-1.5"><Bit value={a} /></td>
                      <td className="py-1.5"><Bit value={b} /></td>
                      <td className="py-1.5"><Bit value={g.fn(a, b)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div className="overflow-hidden rounded-lg border border-logic-border">
            <div className="bg-slate-800/60 px-3 py-2 text-center text-emerald-400 font-bold text-sm">NOT</div>
            <table className="w-full text-center text-sm">
              <thead>
                <tr className="border-b border-logic-border bg-slate-800/30">
                  <th className="py-1.5 text-slate-400">A</th>
                  <th className="py-1.5 text-slate-400">Out</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1].map(a => (
                  <tr key={a} className="border-b border-logic-border/50">
                    <td className="py-1.5"><Bit value={a} /></td>
                    <td className="py-1.5"><Bit value={NOT(a)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>

      <RoleBox>
        In the voting machine, logic gates form the <strong className="text-emerald-400">vote validation circuit</strong>.
        The expression <code className="bg-slate-800 px-2 py-0.5 rounded text-cyan-400 text-xs">VALID_VOTE = SELECTED AND ENABLE AND NOT LOCKED</code> ensures
        a vote is only counted when a candidate button is pressed (SELECTED=1), the control unit has enabled voting (ENABLE=1),
        and the machine is not locked after a previous vote (LOCKED=0). This prevents double-voting and unauthorized access.
      </RoleBox>
    </div>
  );
};

/* ──────────────────────────────────────────────
   TAB 2 — Encoder
   ────────────────────────────────────────────── */
const EncoderTab = () => {
  const [activeInput, setActiveInput] = useState(null);

  const encoderOutput = (idx) => {
    if (idx === null) return [0, 0, 0];
    return [
      (idx >> 2) & 1,
      (idx >> 1) & 1,
      idx & 1,
    ];
  };

  const [a2, a1, a0] = encoderOutput(activeInput);

  return (
    <div className="space-y-6">
      <SectionCard title="8-to-3 Priority Encoder">
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          An encoder converts one of many active input lines into a compact binary code. An <strong className="text-emerald-400">8-to-3 priority encoder</strong> takes
          up to 8 input lines (D0–D7) and outputs a 3-bit binary code representing which input is active. If multiple inputs
          are active simultaneously, the highest-numbered input has priority.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          In our voting machine, each candidate button corresponds to one of the encoder's input lines. When a voter presses
          a button, the encoder converts that selection into a compact 3-bit binary code for further processing.
        </p>
      </SectionCard>

      <SectionCard title="Interactive Encoder Diagram">
        <p className="text-slate-400 text-xs mb-4">Click an input line (D0–D7) to see the corresponding 3-bit output.</p>

        <svg viewBox="0 0 600 320" className="w-full max-w-2xl mx-auto">
          {/* Encoder box */}
          <rect x="200" y="20" width="200" height="280" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="300" y="165" textAnchor="middle" fill="#10b981" fontSize="16" fontWeight="bold">8-to-3</text>
          <text x="300" y="185" textAnchor="middle" fill="#10b981" fontSize="14">ENCODER</text>

          {/* Input lines D0-D7 */}
          {Array.from({ length: 8 }, (_, i) => {
            const y = 40 + i * 34;
            const isActive = activeInput === i;
            const color = isActive ? '#10b981' : '#475569';
            return (
              <g key={i} onClick={() => setActiveInput(isActive ? null : i)} className="cursor-pointer">
                <line x1="40" y1={y} x2="200" y2={y} stroke={color} strokeWidth="2" />
                <circle cx="40" cy={y} r="8" fill={isActive ? '#10b981' : '#1e293b'} stroke={color} strokeWidth="2" />
                <text x="40" y={y + 4} textAnchor="middle" fill={isActive ? '#000' : '#94a3b8'} fontSize="9" fontWeight="bold">D{i}</text>
                {isActive && (
                  <circle cx="40" cy={y} r="12" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5">
                    <animate attributeName="r" from="8" to="16" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Output lines A2, A1, A0 */}
          {[
            { label: 'A2', val: a2, y: 100 },
            { label: 'A1', val: a1, y: 160 },
            { label: 'A0', val: a0, y: 220 },
          ].map(({ label, val, y }) => {
            const color = val ? '#10b981' : '#475569';
            return (
              <g key={label}>
                <line x1="400" y1={y} x2="560" y2={y} stroke={color} strokeWidth="2" />
                <circle cx="560" cy={y} r="8" fill={val ? '#10b981' : '#1e293b'} stroke={color} strokeWidth="2" />
                <text x="560" y={y + 4} textAnchor="middle" fill={val ? '#000' : '#94a3b8'} fontSize="9" fontWeight="bold">{label}</text>
                <text x="420" y={y - 8} fill="#94a3b8" fontSize="10">{label} = {val}</text>
              </g>
            );
          })}

          {/* Output label */}
          <text x="480" y="280" textAnchor="middle" fill="#94a3b8" fontSize="11">
            Output: {activeInput !== null ? `${a2}${a1}${a0}` : '---'}
          </text>
        </svg>
      </SectionCard>

      {/* Truth Table */}
      <SectionCard title="Encoder Truth Table (Key Rows)">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm max-w-lg mx-auto">
            <thead>
              <tr className="border-b border-logic-border bg-slate-800/30">
                <th className="py-2 text-slate-400">Active Input</th>
                <th className="py-2 text-slate-400">A2</th>
                <th className="py-2 text-slate-400">A1</th>
                <th className="py-2 text-slate-400">A0</th>
                <th className="py-2 text-slate-400">Binary</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }, (_, i) => {
                const bits = [(i >> 2) & 1, (i >> 1) & 1, i & 1];
                return (
                  <tr key={i} className={`border-b border-logic-border/50 ${activeInput === i ? 'bg-emerald-500/10' : ''}`}>
                    <td className="py-2 text-emerald-400 font-mono">D{i}</td>
                    <td className="py-2"><Bit value={bits[0]} /></td>
                    <td className="py-2"><Bit value={bits[1]} /></td>
                    <td className="py-2"><Bit value={bits[2]} /></td>
                    <td className="py-2 font-mono text-slate-300">{bits.join('')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Boolean Equations */}
      <SectionCard title="Boolean Equations">
        <div className="space-y-3 font-mono text-sm">
          <div className="bg-slate-800/60 rounded-lg p-3 border border-logic-border">
            <span className="text-emerald-400">A2</span> <span className="text-slate-500">=</span>{' '}
            <span className="text-cyan-400">D4 + D5 + D6 + D7</span>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-3 border border-logic-border">
            <span className="text-emerald-400">A1</span> <span className="text-slate-500">=</span>{' '}
            <span className="text-cyan-400">D2 + D3 + D6 + D7</span>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-3 border border-logic-border">
            <span className="text-emerald-400">A0</span> <span className="text-slate-500">=</span>{' '}
            <span className="text-cyan-400">D1 + D3 + D5 + D7</span>
          </div>
        </div>
      </SectionCard>

      <RoleBox>
        When a voter presses a candidate button (e.g., Candidate 3 → D3), the encoder converts it to binary code{' '}
        <code className="bg-slate-800 px-2 py-0.5 rounded text-cyan-400 text-xs">011</code>. This 3-bit code is then
        stored in the register and used by the decoder to identify which candidate's vote counter to increment. The encoder
        reduces 8 physical buttons to a compact 3-bit digital signal.
      </RoleBox>
    </div>
  );
};

/* ──────────────────────────────────────────────
   TAB 3 — Decoder
   ────────────────────────────────────────────── */
const DecoderTab = () => {
  const [inputBits, setInputBits] = useState([0, 0, 0]);

  const toggleBit = (idx) => {
    setInputBits(prev => {
      const next = [...prev];
      next[idx] = next[idx] ? 0 : 1;
      return next;
    });
  };

  const decodedIdx = (inputBits[0] << 2) | (inputBits[1] << 1) | inputBits[2];

  return (
    <div className="space-y-6">
      <SectionCard title="3-to-8 Binary Decoder">
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          A decoder performs the inverse operation of an encoder. It takes a compact binary code as input and activates
          exactly <strong className="text-emerald-400">one</strong> of many output lines corresponding to that code.
          A 3-to-8 decoder has 3 input lines and 8 output lines — exactly one output goes HIGH for each unique combination of inputs.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          Each output line corresponds to a minterm: <code className="text-cyan-400 text-xs">Y0 = A2'·A1'·A0'</code>,{' '}
          <code className="text-cyan-400 text-xs">Y1 = A2'·A1'·A0</code>, etc.
        </p>
      </SectionCard>

      <SectionCard title="Interactive Decoder Diagram">
        <p className="text-slate-400 text-xs mb-4">Click the input bits (A2, A1, A0) to toggle them and see which output line activates.</p>

        <svg viewBox="0 0 600 320" className="w-full max-w-2xl mx-auto">
          {/* Decoder box */}
          <rect x="200" y="20" width="200" height="280" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="300" y="165" textAnchor="middle" fill="#10b981" fontSize="16" fontWeight="bold">3-to-8</text>
          <text x="300" y="185" textAnchor="middle" fill="#10b981" fontSize="14">DECODER</text>

          {/* Input lines */}
          {['A2', 'A1', 'A0'].map((label, i) => {
            const y = 100 + i * 60;
            const val = inputBits[i];
            const color = val ? '#10b981' : '#475569';
            return (
              <g key={label} onClick={() => toggleBit(i)} className="cursor-pointer">
                <line x1="40" y1={y} x2="200" y2={y} stroke={color} strokeWidth="2" />
                <circle cx="40" cy={y} r="12" fill={val ? '#10b981' : '#1e293b'} stroke={color} strokeWidth="2" />
                <text x="40" y={y + 4} textAnchor="middle" fill={val ? '#000' : '#94a3b8'} fontSize="10" fontWeight="bold">{label}</text>
                <text x="70" y={y - 8} fill="#94a3b8" fontSize="10">{val}</text>
              </g>
            );
          })}

          {/* Output lines Y0-Y7 */}
          {Array.from({ length: 8 }, (_, i) => {
            const y = 40 + i * 34;
            const isActive = decodedIdx === i;
            const color = isActive ? '#10b981' : '#475569';
            return (
              <g key={i}>
                <line x1="400" y1={y} x2="560" y2={y} stroke={color} strokeWidth="2" />
                <circle cx="560" cy={y} r="8" fill={isActive ? '#10b981' : '#1e293b'} stroke={color} strokeWidth="2" />
                <text x="560" y={y + 4} textAnchor="middle" fill={isActive ? '#000' : '#94a3b8'} fontSize="9" fontWeight="bold">Y{i}</text>
                {isActive && (
                  <circle cx="560" cy={y} r="12" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5">
                    <animate attributeName="r" from="8" to="16" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Selected info */}
          <text x="300" y="310" textAnchor="middle" fill="#94a3b8" fontSize="11">
            Input: {inputBits.join('')} → Active Output: Y{decodedIdx}
          </text>
        </svg>
      </SectionCard>

      {/* Truth Table */}
      <SectionCard title="Decoder Truth Table">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm">
            <thead>
              <tr className="border-b border-logic-border bg-slate-800/30">
                <th className="py-2 text-slate-400">A2</th>
                <th className="py-2 text-slate-400">A1</th>
                <th className="py-2 text-slate-400">A0</th>
                <th className="py-2 text-slate-400">Active Output</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }, (_, i) => {
                const bits = [(i >> 2) & 1, (i >> 1) & 1, i & 1];
                const isActive = decodedIdx === i;
                return (
                  <tr key={i} className={`border-b border-logic-border/50 ${isActive ? 'bg-emerald-500/10' : ''}`}>
                    <td className="py-2"><Bit value={bits[0]} /></td>
                    <td className="py-2"><Bit value={bits[1]} /></td>
                    <td className="py-2"><Bit value={bits[2]} /></td>
                    <td className="py-2 text-emerald-400 font-mono font-bold">Y{i}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <RoleBox>
        After the encoder produces a 3-bit binary code representing the selected candidate, the decoder reverses this
        process — it activates the specific output line (Y0–Y7) corresponding to that candidate. This activated line
        triggers the <strong className="text-emerald-400">increment signal</strong> for the correct candidate's vote counter,
        ensuring the vote is tallied in the right bin.
      </RoleBox>
    </div>
  );
};

/* ──────────────────────────────────────────────
   TAB 4 — D Flip-Flop
   ────────────────────────────────────────────── */
const DFlipFlopTab = () => {
  const [d, setD] = useState(0);
  const [q, setQ] = useState(0);
  const [clockPulse, setClockPulse] = useState(false);

  const triggerClock = () => {
    setClockPulse(true);
    setQ(d);
    setTimeout(() => setClockPulse(false), 600);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="D Flip-Flop (Data Flip-Flop)">
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          The D (Data) Flip-Flop is a fundamental sequential logic element that captures the value of the D input at
          a specific moment — the <strong className="text-emerald-400">rising edge of the clock signal</strong>. It has
          one data input (D), a clock input (CLK), and two outputs: Q and Q̄ (complement of Q).
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          Unlike combinational logic (which depends only on current inputs), the D flip-flop introduces <em>memory</em> —
          it stores a single bit of data. The output Q holds the previously captured value until the next clock edge.
        </p>
      </SectionCard>

      <SectionCard title="Interactive D Flip-Flop">
        <p className="text-slate-400 text-xs mb-4">Set the D input, then click the clock button to capture the value.</p>

        <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
          <button onClick={() => setD(v => (v ? 0 : 1))} className="btn-secondary flex items-center gap-2">
            D Input: <Bit value={d} />
          </button>
          <button
            onClick={triggerClock}
            className={`btn-primary ${clockPulse ? 'clock-pulse' : ''}`}
          >
            <Clock size={16} /> Clock ↑ (Rising Edge)
          </button>
        </div>

        <svg viewBox="0 0 500 200" className="w-full max-w-xl mx-auto">
          {/* FF box */}
          <rect x="150" y="30" width="200" height="140" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <text x="250" y="105" textAnchor="middle" fill="#10b981" fontSize="16" fontWeight="bold">D FF</text>

          {/* D input */}
          <line x1="20" y1="70" x2="150" y2="70" stroke={d ? '#10b981' : '#475569'} strokeWidth="2" />
          <circle cx="20" cy="70" r="8" fill={d ? '#10b981' : '#1e293b'} stroke={d ? '#10b981' : '#475569'} strokeWidth="2" />
          <text x="20" y="74" textAnchor="middle" fill={d ? '#000' : '#94a3b8'} fontSize="10" fontWeight="bold">D</text>
          <text x="160" y="65" fill="#94a3b8" fontSize="11">D</text>

          {/* CLK input */}
          <line x1="20" y1="130" x2="150" y2="130" stroke={clockPulse ? '#06b6d4' : '#475569'} strokeWidth="2" />
          <polygon points="150,122 165,130 150,138" fill="none" stroke={clockPulse ? '#06b6d4' : '#475569'} strokeWidth="1.5" />
          <circle cx="20" cy="130" r="8" fill={clockPulse ? '#06b6d4' : '#1e293b'} stroke={clockPulse ? '#06b6d4' : '#475569'} strokeWidth="2" />
          <text x="20" y="134" textAnchor="middle" fill={clockPulse ? '#000' : '#94a3b8'} fontSize="8" fontWeight="bold">CLK</text>

          {/* Q output */}
          <line x1="350" y1="70" x2="480" y2="70" stroke={q ? '#10b981' : '#475569'} strokeWidth="2" />
          <circle cx="480" cy="70" r="8" fill={q ? '#10b981' : '#1e293b'} stroke={q ? '#10b981' : '#475569'} strokeWidth="2" />
          <text x="480" y="74" textAnchor="middle" fill={q ? '#000' : '#94a3b8'} fontSize="10" fontWeight="bold">Q</text>
          <text x="338" y="65" fill="#94a3b8" fontSize="11" textAnchor="end">Q</text>

          {/* Q̄ output */}
          <line x1="350" y1="130" x2="480" y2="130" stroke={!q ? '#10b981' : '#475569'} strokeWidth="2" />
          <circle cx="480" cy="130" r="8" fill={!q ? '#10b981' : '#1e293b'} stroke={!q ? '#10b981' : '#475569'} strokeWidth="2" />
          <text x="480" y="134" textAnchor="middle" fill={!q ? '#000' : '#94a3b8'} fontSize="10" fontWeight="bold">Q̄</text>
          <circle cx="355" cy="130" r="5" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="330" y="125" fill="#94a3b8" fontSize="11" textAnchor="end">Q̄</text>

          {/* State display */}
          <text x="250" y="195" textAnchor="middle" fill="#94a3b8" fontSize="12">
            D={d}  |  Q={q}  |  Q̄={q ? 0 : 1}
          </text>
        </svg>
      </SectionCard>

      {/* Characteristic Table */}
      <SectionCard title="Characteristic Table">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm max-w-md mx-auto">
            <thead>
              <tr className="border-b border-logic-border bg-slate-800/30">
                <th className="py-2 text-slate-400">CLK</th>
                <th className="py-2 text-slate-400">D</th>
                <th className="py-2 text-slate-400">Q(next)</th>
                <th className="py-2 text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-logic-border/50">
                <td className="py-2 text-slate-500">No edge</td>
                <td className="py-2 text-slate-500">X</td>
                <td className="py-2 text-slate-500">Q(prev)</td>
                <td className="py-2 text-slate-500 text-xs">No change (hold)</td>
              </tr>
              <tr className="border-b border-logic-border/50">
                <td className="py-2 text-cyan-400">↑</td>
                <td className="py-2"><Bit value={0} /></td>
                <td className="py-2"><Bit value={0} /></td>
                <td className="py-2 text-slate-300 text-xs">Reset</td>
              </tr>
              <tr className="border-b border-logic-border/50">
                <td className="py-2 text-cyan-400">↑</td>
                <td className="py-2"><Bit value={1} /></td>
                <td className="py-2"><Bit value={1} /></td>
                <td className="py-2 text-slate-300 text-xs">Set</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Timing Diagram */}
      <SectionCard title="Timing Diagram Concept">
        <svg viewBox="0 0 500 180" className="w-full max-w-xl mx-auto">
          {/* Labels */}
          <text x="10" y="35" fill="#94a3b8" fontSize="12" fontWeight="bold">D</text>
          <text x="10" y="95" fill="#06b6d4" fontSize="12" fontWeight="bold">CLK</text>
          <text x="10" y="155" fill="#10b981" fontSize="12" fontWeight="bold">Q</text>

          {/* D waveform — stays high for a period */}
          <polyline points="40,40 40,40 100,40 100,20 250,20 250,40 350,40 350,20 450,20 450,40 490,40"
            fill="none" stroke="#94a3b8" strokeWidth="2" />

          {/* CLK — square wave pulses */}
          <polyline points="40,100 40,100 80,100 80,80 120,80 120,100 200,100 200,80 240,80 240,100 320,100 320,80 360,80 360,100 440,100 440,80 480,80 480,100 490,100"
            fill="none" stroke="#06b6d4" strokeWidth="2" />
          {/* Rising edge arrows */}
          {[80, 200, 320, 440].map(x => (
            <g key={x}>
              <line x1={x} y1="105" x2={x} y2="115" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 2" />
              <text x={x} y="123" textAnchor="middle" fill="#06b6d4" fontSize="8">↑</text>
            </g>
          ))}

          {/* Q waveform — captures D at rising edge */}
          <polyline points="40,160 80,160 80,160 200,160 200,140 320,140 320,140 440,140 440,140 490,140"
            fill="none" stroke="#10b981" strokeWidth="2" />

          {/* Time axis */}
          <line x1="40" y1="170" x2="490" y2="170" stroke="#334155" strokeWidth="1" />
          <text x="265" y="178" textAnchor="middle" fill="#475569" fontSize="9">Time →</text>
        </svg>
        <p className="text-slate-400 text-xs text-center mt-2">
          Q captures the value of D only at each rising edge (↑) of the clock. Between edges, Q holds its previous value.
        </p>
      </SectionCard>

      <RoleBox>
        D flip-flops store the binary code of the selected candidate when the{' '}
        <strong className="text-emerald-400">vote confirmation clock pulse</strong> occurs.
        A group of three D flip-flops forms a 3-bit register that temporarily holds the candidate code (e.g., 011 for Candidate 3).
        The data is only latched on the clock edge, ensuring stability and preventing glitches from affecting the stored value.
      </RoleBox>
    </div>
  );
};

/* ──────────────────────────────────────────────
   TAB 5 — Binary Counter
   ────────────────────────────────────────────── */
const BinaryCounterTab = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(c => (c >= 15 ? 0 : c + 1));
  const reset = () => setCount(0);

  const bits = [
    (count >> 3) & 1,
    (count >> 2) & 1,
    (count >> 1) & 1,
    count & 1,
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="4-Bit Synchronous Binary Counter">
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          A <strong className="text-emerald-400">4-bit synchronous counter</strong> is a sequential circuit that counts
          from 0000 (decimal 0) to 1111 (decimal 15). All flip-flops are clocked simultaneously (synchronous), and
          combinational logic determines which flip-flops toggle on each clock pulse. The counter increments by 1 on every
          rising clock edge.
        </p>
      </SectionCard>

      <SectionCard title="Interactive Counter">
        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
          <button onClick={increment} className="btn-primary">
            <Clock size={16} /> Clock Pulse (Count +1)
          </button>
          <button onClick={reset} className="btn-danger">
            Reset
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-slate-400 text-sm mb-2">Current Count</div>
          <div className="flex items-center justify-center gap-2">
            {bits.map((b, i) => (
              <div key={i} className="text-center">
                <div className="text-slate-500 text-xs mb-1">Q{3 - i}</div>
                <Bit value={b} />
              </div>
            ))}
            <span className="text-slate-500 mx-2">=</span>
            <span className="text-2xl font-bold text-emerald-400">{count}</span>
          </div>
        </div>

        {/* SVG 4-bit counter diagram */}
        <svg viewBox="0 0 600 160" className="w-full max-w-2xl mx-auto">
          {/* Clock input */}
          <text x="10" y="100" fill="#06b6d4" fontSize="10" fontWeight="bold">CLK</text>
          <line x1="50" y1="95" x2="80" y2="95" stroke="#06b6d4" strokeWidth="2" />

          {/* 4 Flip-Flops */}
          {[0, 1, 2, 3].map(i => {
            const x = 80 + i * 130;
            const bitVal = bits[3 - i];
            const borderColor = bitVal ? '#10b981' : '#334155';
            return (
              <g key={i}>
                <rect x={x} y="40" width="100" height="100" rx="6" fill="#0f172a" stroke={borderColor} strokeWidth="2" />
                <text x={x + 50} y="70" textAnchor="middle" fill="#94a3b8" fontSize="11">D FF</text>
                <text x={x + 50} y="88" textAnchor="middle" fill="#10b981" fontSize="14" fontWeight="bold">Q{i}</text>
                <text x={x + 50} y="108" textAnchor="middle" fill={bitVal ? '#10b981' : '#475569'} fontSize="18" fontWeight="bold">
                  {bitVal}
                </text>
                {/* Clock triangle */}
                <polygon points={`${x},125 ${x + 10},130 ${x},135`} fill="none" stroke="#06b6d4" strokeWidth="1" />
                {/* Connect clock line */}
                <line x1={x - 30} y1="95" x2={x} y2="95" stroke="#06b6d4" strokeWidth="1.5" />
                <line x1={x} y1="95" x2={x} y2="130" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 2" />
                {/* Connect to next */}
                {i < 3 && <line x1={x + 100} y1="85" x2={x + 130} y2="85" stroke="#475569" strokeWidth="1.5" />}
              </g>
            );
          })}
        </svg>
      </SectionCard>

      {/* Count Sequence Table */}
      <SectionCard title="Count Sequence (0–15)">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
            {Array.from({ length: 16 }, (_, i) => {
              const b = [(i >> 3) & 1, (i >> 2) & 1, (i >> 1) & 1, i & 1];
              const isActive = count === i;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2 rounded border ${
                    isActive
                      ? 'border-emerald-500/60 bg-emerald-500/10'
                      : 'border-logic-border bg-slate-800/30'
                  }`}
                >
                  <span className="text-slate-400 text-xs w-6 text-right mr-2">{i}</span>
                  <div className="flex gap-1">
                    {b.map((v, j) => (
                      <Bit key={j} value={v} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      <RoleBox>
        Each candidate has a dedicated 4-bit binary counter in the voting machine. When a valid vote is cast for a candidate,
        the corresponding counter receives a clock pulse and <strong className="text-emerald-400">increments by 1</strong>.
        A 4-bit counter can count from 0 to 15 votes. In real voting machines, larger counters (8-bit, 16-bit) are used to
        handle more votes. After all voting is complete, each counter holds the total vote tally for its candidate.
      </RoleBox>
    </div>
  );
};

/* ──────────────────────────────────────────────
   TAB 6 — Register
   ────────────────────────────────────────────── */
const RegisterTab = () => {
  const [dInputs, setDInputs] = useState([0, 0, 0, 0]);
  const [qOutputs, setQOutputs] = useState([0, 0, 0, 0]);
  const [loaded, setLoaded] = useState(false);

  const toggleD = (idx) => {
    setDInputs(prev => {
      const next = [...prev];
      next[idx] = next[idx] ? 0 : 1;
      return next;
    });
  };

  const loadRegister = () => {
    setQOutputs([...dInputs]);
    setLoaded(true);
    setTimeout(() => setLoaded(false), 600);
  };

  const resetRegister = () => {
    setQOutputs([0, 0, 0, 0]);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Parallel-In Parallel-Out (PIPO) Register">
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          A <strong className="text-emerald-400">parallel-in parallel-out register</strong> is a group of flip-flops
          that can load multiple bits simultaneously and output them all at once. Unlike a shift register (which moves
          data serially), a PIPO register transfers all data bits in parallel — making it much faster.
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          It has D inputs (data), a <strong className="text-cyan-400">Load</strong> signal (to capture inputs),
          a <strong className="text-red-400">Reset</strong> signal (to clear all outputs to 0), and Q outputs (stored data).
        </p>
      </SectionCard>

      <SectionCard title="Interactive Register">
        <p className="text-slate-400 text-xs mb-4">Click D inputs to set values, then press Load to capture them into the register.</p>

        <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
          {dInputs.map((d, i) => (
            <button key={i} onClick={() => toggleD(i)} className="btn-secondary flex items-center gap-1">
              D{i}: <Bit value={d} />
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mb-6">
          <button onClick={loadRegister} className={`btn-primary ${loaded ? 'clock-pulse' : ''}`}>
            <Zap size={16} /> Load
          </button>
          <button onClick={resetRegister} className="btn-danger">
            Reset
          </button>
        </div>

        <svg viewBox="0 0 600 220" className="w-full max-w-2xl mx-auto">
          {/* Register box */}
          <rect x="150" y="30" width="300" height="150" rx="8" fill="#0f172a" stroke={loaded ? '#10b981' : '#334155'} strokeWidth="2" />
          <text x="300" y="110" textAnchor="middle" fill="#10b981" fontSize="16" fontWeight="bold">4-Bit PIPO Register</text>

          {/* D inputs */}
          {dInputs.map((d, i) => {
            const x = 190 + i * 65;
            const color = d ? '#10b981' : '#475569';
            return (
              <g key={`d${i}`}>
                <line x1={x} y1="0" x2={x} y2="30" stroke={color} strokeWidth="2" />
                <circle cx={x} cy="5" r="6" fill={d ? '#10b981' : '#1e293b'} stroke={color} strokeWidth="1.5" />
                <text x={x} y="8" textAnchor="middle" fill={d ? '#000' : '#94a3b8'} fontSize="8" fontWeight="bold">D{i}</text>
              </g>
            );
          })}

          {/* Q outputs */}
          {qOutputs.map((q, i) => {
            const x = 190 + i * 65;
            const color = q ? '#10b981' : '#475569';
            return (
              <g key={`q${i}`}>
                <line x1={x} y1="180" x2={x} y2="210" stroke={color} strokeWidth="2" />
                <circle cx={x} cy="210" r="6" fill={q ? '#10b981' : '#1e293b'} stroke={color} strokeWidth="1.5" />
                <text x={x} y="213" textAnchor="middle" fill={q ? '#000' : '#94a3b8'} fontSize="8" fontWeight="bold">Q{i}</text>
              </g>
            );
          })}

          {/* Load signal */}
          <line x1="80" y1="80" x2="150" y2="80" stroke={loaded ? '#06b6d4' : '#475569'} strokeWidth="2" />
          <text x="75" y="76" textAnchor="end" fill="#06b6d4" fontSize="10" fontWeight="bold">Load</text>

          {/* Reset signal */}
          <line x1="80" y1="140" x2="150" y2="140" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="75" y="136" textAnchor="end" fill="#ef4444" fontSize="10" fontWeight="bold">Reset</text>

          {/* Internal FF boxes */}
          {[0, 1, 2, 3].map(i => {
            const x = 175 + i * 65;
            const q = qOutputs[i];
            return (
              <g key={`ff${i}`}>
                <rect x={x} y="55" width="30" height="50" rx="3" fill={q ? '#10b98115' : '#1e293b'} stroke={q ? '#10b981' : '#475569'} strokeWidth="1" />
                <text x={x + 15} y="85" textAnchor="middle" fill={q ? '#10b981' : '#475569'} fontSize="14" fontWeight="bold">{q}</text>
              </g>
            );
          })}
        </svg>
      </SectionCard>

      <RoleBox>
        In the voting machine, a register <strong className="text-emerald-400">temporarily stores</strong> the encoded
        candidate binary code after a button press. The Load signal is triggered when a valid vote is confirmed, capturing
        the encoder output. The stored binary code is then forwarded to the decoder to identify which candidate's counter
        to increment. After processing, the register can be reset for the next voter.
      </RoleBox>
    </div>
  );
};

/* ──────────────────────────────────────────────
   TAB 7 — Seven-Segment Display
   ────────────────────────────────────────────── */
const SevenSegmentTab = () => {
  const [selectedDigit, setSelectedDigit] = useState(0);

  /* Segment map: [a, b, c, d, e, f, g] for digits 0-9 */
  const segmentMap = [
    [1, 1, 1, 1, 1, 1, 0], // 0
    [0, 1, 1, 0, 0, 0, 0], // 1
    [1, 1, 0, 1, 1, 0, 1], // 2
    [1, 1, 1, 1, 0, 0, 1], // 3
    [0, 1, 1, 0, 0, 1, 1], // 4
    [1, 0, 1, 1, 0, 1, 1], // 5
    [1, 0, 1, 1, 1, 1, 1], // 6
    [1, 1, 1, 0, 0, 0, 0], // 7
    [1, 1, 1, 1, 1, 1, 1], // 8
    [1, 1, 1, 1, 0, 1, 1], // 9
  ];

  const segs = segmentMap[selectedDigit];
  const segLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  /* BCD bits for the selected digit */
  const bcd = [
    (selectedDigit >> 3) & 1,
    (selectedDigit >> 2) & 1,
    (selectedDigit >> 1) & 1,
    selectedDigit & 1,
  ];

  const SegDisplay = ({ segments, size = 1 }) => {
    const s = size;
    /* Segment coordinates — classic 7-segment geometry */
    const segPaths = [
      /* a (top) */     `M${18*s},${4*s} L${62*s},${4*s} L${58*s},${10*s} L${22*s},${10*s} Z`,
      /* b (top-right) */`M${64*s},${6*s} L${70*s},${6*s} L${68*s},${38*s} L${62*s},${38*s} Z`,
      /* c (bot-right) */`M${62*s},${42*s} L${68*s},${42*s} L${66*s},${74*s} L${60*s},${74*s} Z`,
      /* d (bottom) */   `M${16*s},${76*s} L${60*s},${76*s} L${56*s},${70*s} L${20*s},${70*s} Z`,
      /* e (bot-left) */ `M${12*s},${42*s} L${18*s},${42*s} L${16*s},${74*s} L${10*s},${74*s} Z`,
      /* f (top-left) */ `M${14*s},${6*s} L${20*s},${6*s} L${18*s},${38*s} L${12*s},${38*s} Z`,
      /* g (middle) */   `M${18*s},${38*s} L${62*s},${38*s} L${60*s},${42*s} L${20*s},${42*s} Z`,
    ];

    return (
      <svg viewBox={`0 0 ${80*s} ${80*s}`} className="w-32 h-32 mx-auto">
        <rect x="0" y="0" width={80*s} height={80*s} rx="6" fill="#0f172a" />
        {segPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            className={segments[i] ? 'seg-on' : 'seg-off'}
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <SectionCard title="BCD to Seven-Segment Decoder">
        <p className="text-slate-300 text-sm leading-relaxed mb-3">
          A <strong className="text-emerald-400">seven-segment display</strong> consists of 7 LED segments (labeled a–g)
          arranged in a figure-8 pattern. A BCD (Binary-Coded Decimal) to 7-segment decoder takes a 4-bit binary input
          (0000–1001) and activates the appropriate segments to display the corresponding decimal digit (0–9).
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          This is a purely combinational circuit — each segment output is a Boolean function of the 4 BCD input bits.
        </p>
      </SectionCard>

      <SectionCard title="Segment Layout">
        <div className="flex items-start justify-center gap-8 flex-wrap">
          {/* Labeled display */}
          <div>
            <svg viewBox="0 0 120 120" className="w-40 h-40 mx-auto">
              <rect x="0" y="0" width="120" height="120" rx="6" fill="#0f172a" />
              {/* a - top */}
              <rect x="28" y="8" width="64" height="8" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.5" />
              <text x="60" y="14" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">a</text>
              {/* b - top right */}
              <rect x="92" y="16" width="8" height="40" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.5" />
              <text x="96" y="38" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">b</text>
              {/* c - bottom right */}
              <rect x="88" y="60" width="8" height="40" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.5" />
              <text x="92" y="82" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">c</text>
              {/* d - bottom */}
              <rect x="24" y="100" width="64" height="8" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.5" />
              <text x="56" y="106" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">d</text>
              {/* e - bottom left */}
              <rect x="16" y="60" width="8" height="40" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.5" />
              <text x="20" y="82" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">e</text>
              {/* f - top left */}
              <rect x="20" y="16" width="8" height="40" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.5" />
              <text x="24" y="38" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">f</text>
              {/* g - middle */}
              <rect x="28" y="54" width="64" height="8" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.5" />
              <text x="60" y="60" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="bold">g</text>
            </svg>
            <p className="text-center text-slate-500 text-xs mt-2">Segment labels (a–g)</p>
          </div>

          {/* Active display */}
          <div>
            <SegDisplay segments={segs} size={1} />
            <p className="text-center text-emerald-400 text-lg font-bold mt-2">Digit: {selectedDigit}</p>
          </div>
        </div>
      </SectionCard>

      {/* Digit Selector */}
      <SectionCard title="Interactive: Select a Digit">
        <p className="text-slate-400 text-xs mb-4">Click any digit to see which segments illuminate on the display above.</p>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {Array.from({ length: 10 }, (_, i) => (
            <button
              key={i}
              onClick={() => setSelectedDigit(i)}
              className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                selectedDigit === i
                  ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500'
                  : 'bg-slate-800 text-slate-400 border border-logic-border hover:border-slate-500'
              }`}
            >
              {i}
            </button>
          ))}
        </div>

        {/* BCD Input */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-slate-400 text-sm">BCD Input:</span>
          {bcd.map((b, i) => (
            <div key={i} className="text-center">
              <div className="text-slate-500 text-xs mb-1">{['B3', 'B2', 'B1', 'B0'][i]}</div>
              <Bit value={b} />
            </div>
          ))}
        </div>

        {/* Active Segments */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-slate-400 text-sm">Active segments:</span>
          {segLabels.map((label, i) => (
            <span
              key={label}
              className={`px-2 py-1 rounded text-xs font-bold ${
                segs[i] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </SectionCard>

      {/* Segment Activation Table */}
      <SectionCard title="Segment Activation Table">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm">
            <thead>
              <tr className="border-b border-logic-border bg-slate-800/30">
                <th className="py-2 text-slate-400">Digit</th>
                <th className="py-2 text-slate-400">BCD</th>
                {segLabels.map(l => (
                  <th key={l} className="py-2 text-slate-400">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {segmentMap.map((segments, digit) => {
                const isActive = selectedDigit === digit;
                const bcdStr = [
                  (digit >> 3) & 1,
                  (digit >> 2) & 1,
                  (digit >> 1) & 1,
                  digit & 1,
                ].join('');
                return (
                  <tr
                    key={digit}
                    className={`border-b border-logic-border/50 cursor-pointer hover:bg-slate-800/40 ${
                      isActive ? 'bg-emerald-500/10' : ''
                    }`}
                    onClick={() => setSelectedDigit(digit)}
                  >
                    <td className="py-2 text-emerald-400 font-bold">{digit}</td>
                    <td className="py-2 font-mono text-slate-300 text-xs">{bcdStr}</td>
                    {segments.map((s, i) => (
                      <td key={i} className="py-2"><Bit value={s} /></td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <RoleBox>
        In the voting machine, the seven-segment display shows the <strong className="text-emerald-400">total vote count</strong> for
        each candidate in human-readable decimal format. The binary counter's output (e.g., 0101 = 5 votes) is fed through a
        BCD-to-7-segment decoder, which activates the correct LED segments to display the number "5". This makes results
        instantly readable without needing to interpret binary values.
      </RoleBox>
    </div>
  );
};

/* ──────────────────────────────────────────────
   TABS configuration
   ────────────────────────────────────────────── */
const TABS = [
  { id: 'gates', label: 'Logic Gates', icon: Cpu, Component: LogicGatesTab },
  { id: 'encoder', label: 'Encoder', icon: Binary, Component: EncoderTab },
  { id: 'decoder', label: 'Decoder', icon: Hash, Component: DecoderTab },
  { id: 'flipflop', label: 'D Flip-Flop', icon: Clock, Component: DFlipFlopTab },
  { id: 'counter', label: 'Binary Counter', icon: Hash, Component: BinaryCounterTab },
  { id: 'register', label: 'Register', icon: HardDrive, Component: RegisterTab },
  { id: 'sevenseg', label: 'Seven-Segment Display', icon: Monitor, Component: SevenSegmentTab },
];

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
const DLDLearningCenter = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState('gates');

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.Component || LogicGatesTab;

  return (
    <div className="min-h-screen circuit-board-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-4 text-sm"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <BookOpen size={24} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Digital Logic Design Learning Center</h1>
              <p className="text-slate-400 text-sm mt-1">
                Understanding the Digital Circuits Inside an Electronic Voting Machine
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-1 bg-logic-card border border-logic-border rounded-xl p-1.5 min-w-max">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <ActiveComponent />

        {/* Footer hint */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-logic-border rounded-lg px-4 py-2 text-xs text-slate-500">
            <Info size={14} />
            Explore each tab to understand how these DLD components work together to build a complete Electronic Voting Machine.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DLDLearningCenter;
