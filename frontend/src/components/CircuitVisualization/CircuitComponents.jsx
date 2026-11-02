import React from 'react';

/**
 * Logic Gate SVG Components
 * Standard IEEE-style gate symbols with signal-aware styling
 */

export function ANDGate({ x = 0, y = 0, inputA = 0, inputB = 0, output = 0, label = 'AND', scale = 1 }) {
  const active = output ? true : false;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <title>{label}: {inputA} AND {inputB} = {output}</title>
      {/* Gate body */}
      <path
        d="M 0 0 L 0 40 L 20 40 A 20 20 0 0 0 20 0 Z"
        fill={active ? 'rgba(16,185,129,0.15)' : '#131e36'}
        stroke={active ? '#10b981' : '#334155'}
        strokeWidth="2"
      />
      {/* Label */}
      <text x="14" y="24" fontSize="9" fill={active ? '#6ee7b7' : '#64748b'} fontFamily="monospace" textAnchor="middle">&amp;</text>
      {/* Input dots */}
      <circle cx="-4" cy="12" r="3" className={inputA ? 'seg-on' : 'seg-off'} />
      <circle cx="-4" cy="28" r="3" className={inputB ? 'seg-on' : 'seg-off'} />
      {/* Output dot */}
      <circle cx="42" cy="20" r="3" className={output ? 'seg-on' : 'seg-off'} />
    </g>
  );
}

export function ORGate({ x = 0, y = 0, inputA = 0, inputB = 0, output = 0, label = 'OR', scale = 1 }) {
  const active = output ? true : false;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <title>{label}: {inputA} OR {inputB} = {output}</title>
      <path
        d="M 0 0 Q 10 20 0 40 Q 20 35 35 20 Q 20 5 0 0"
        fill={active ? 'rgba(16,185,129,0.15)' : '#131e36'}
        stroke={active ? '#10b981' : '#334155'}
        strokeWidth="2"
      />
      <text x="14" y="24" fontSize="9" fill={active ? '#6ee7b7' : '#64748b'} fontFamily="monospace" textAnchor="middle">≥1</text>
      <circle cx="-4" cy="12" r="3" className={inputA ? 'seg-on' : 'seg-off'} />
      <circle cx="-4" cy="28" r="3" className={inputB ? 'seg-on' : 'seg-off'} />
      <circle cx="38" cy="20" r="3" className={output ? 'seg-on' : 'seg-off'} />
    </g>
  );
}

export function NOTGate({ x = 0, y = 0, input = 0, output = 0, label = 'NOT', scale = 1 }) {
  const active = output ? true : false;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <title>{label}: NOT {input} = {output}</title>
      <polygon
        points="0,0 0,30 25,15"
        fill={active ? 'rgba(16,185,129,0.15)' : '#131e36'}
        stroke={active ? '#10b981' : '#334155'}
        strokeWidth="2"
      />
      <circle cx="28" cy="15" r="3" fill="none" stroke={active ? '#10b981' : '#334155'} strokeWidth="2" />
      <circle cx="-4" cy="15" r="3" className={input ? 'seg-on' : 'seg-off'} />
      <circle cx="34" cy="15" r="3" className={output ? 'seg-on' : 'seg-off'} />
    </g>
  );
}

export function XORGate({ x = 0, y = 0, inputA = 0, inputB = 0, output = 0, label = 'XOR', scale = 1 }) {
  const active = output ? true : false;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <title>{label}: {inputA} XOR {inputB} = {output}</title>
      <path
        d="M 4 0 Q 14 20 4 40 Q 24 35 39 20 Q 24 5 4 0"
        fill={active ? 'rgba(16,185,129,0.15)' : '#131e36'}
        stroke={active ? '#10b981' : '#334155'}
        strokeWidth="2"
      />
      <path
        d="M 0 0 Q 10 20 0 40"
        fill="none"
        stroke={active ? '#10b981' : '#334155'}
        strokeWidth="2"
      />
      <text x="18" y="24" fontSize="9" fill={active ? '#6ee7b7' : '#64748b'} fontFamily="monospace" textAnchor="middle">=1</text>
      <circle cx="-4" cy="12" r="3" className={inputA ? 'seg-on' : 'seg-off'} />
      <circle cx="-4" cy="28" r="3" className={inputB ? 'seg-on' : 'seg-off'} />
      <circle cx="42" cy="20" r="3" className={output ? 'seg-on' : 'seg-off'} />
    </g>
  );
}

/**
 * Encoder Block
 */
export function EncoderBlock({ x = 0, y = 0, inputs = [], outputs = [0, 0, 0], valid = 0, active = false }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x="0" y="0" width="80" height="120" rx="6"
        fill={active ? 'rgba(16,185,129,0.1)' : '#131e36'}
        stroke={active ? '#10b981' : '#334155'}
        strokeWidth="2"
      />
      <text x="40" y="16" fontSize="10" fill={active ? '#6ee7b7' : '#94a3b8'} fontFamily="monospace" textAnchor="middle" fontWeight="bold">ENCODER</text>
      <text x="40" y="28" fontSize="8" fill="#64748b" fontFamily="monospace" textAnchor="middle">8-to-3</text>

      {/* Input lines */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <g key={i}>
          <line x1="-12" y1={36 + i * 10} x2="0" y2={36 + i * 10}
            stroke={inputs[i] ? '#22d3ee' : '#475569'} strokeWidth="1.5"
            className={inputs[i] ? 'wire-path active' : 'wire-path inactive'}
          />
          <text x="-16" y={39 + i * 10} fontSize="7" fill="#64748b" fontFamily="monospace" textAnchor="end">D{i}</text>
        </g>
      ))}

      {/* Output lines */}
      {['A2', 'A1', 'A0'].map((label, i) => (
        <g key={label}>
          <line x1="80" y1={50 + i * 20} x2="96" y2={50 + i * 20}
            stroke={outputs[i] ? '#22d3ee' : '#475569'} strokeWidth="1.5"
            className={outputs[i] ? 'wire-path active' : 'wire-path inactive'}
          />
          <text x="98" y={53 + i * 20} fontSize="7" fill={outputs[i] ? '#6ee7b7' : '#64748b'} fontFamily="monospace">{label}={outputs[i]}</text>
        </g>
      ))}

      {/* Valid output */}
      <line x1="80" y1="110" x2="96" y2="110"
        stroke={valid ? '#22d3ee' : '#475569'} strokeWidth="1.5"
      />
      <text x="98" y="113" fontSize="7" fill={valid ? '#fbbf24' : '#64748b'} fontFamily="monospace">V={valid}</text>
    </g>
  );
}

/**
 * D Flip-Flop Block
 */
export function FlipFlopBlock({ x = 0, y = 0, D = [0, 0, 0], Q = [0, 0, 0], clockEdge = false, active = false }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x="0" y="0" width="80" height="90" rx="6"
        fill={active ? 'rgba(6,182,212,0.1)' : '#131e36'}
        stroke={active ? '#06b6d4' : '#334155'}
        strokeWidth="2"
        className={clockEdge ? 'clock-pulse' : ''}
      />
      <text x="40" y="16" fontSize="10" fill={active ? '#67e8f9' : '#94a3b8'} fontFamily="monospace" textAnchor="middle" fontWeight="bold">D FLIP-FLOP</text>
      <text x="40" y="28" fontSize="8" fill="#64748b" fontFamily="monospace" textAnchor="middle">3-bit Register</text>

      {/* D inputs */}
      {D.map((d, i) => (
        <g key={`d${i}`}>
          <line x1="-12" y1={40 + i * 16} x2="0" y2={40 + i * 16}
            stroke={d ? '#22d3ee' : '#475569'} strokeWidth="1.5"
          />
          <text x="-16" y={43 + i * 16} fontSize="7" fill="#64748b" fontFamily="monospace" textAnchor="end">D{2 - i}</text>
        </g>
      ))}

      {/* Clock input */}
      <polygon points="0,82 8,78 8,86" fill={clockEdge ? '#06b6d4' : '#475569'} />
      <text x="-16" y="85" fontSize="7" fill={clockEdge ? '#67e8f9' : '#64748b'} fontFamily="monospace" textAnchor="end">CLK</text>

      {/* Q outputs */}
      {Q.map((q, i) => (
        <g key={`q${i}`}>
          <line x1="80" y1={40 + i * 16} x2="96" y2={40 + i * 16}
            stroke={q ? '#22d3ee' : '#475569'} strokeWidth="1.5"
          />
          <text x="98" y={43 + i * 16} fontSize="7" fill={q ? '#6ee7b7' : '#64748b'} fontFamily="monospace">Q{2 - i}={q}</text>
        </g>
      ))}
    </g>
  );
}

/**
 * Decoder Block
 */
export function DecoderBlock({ x = 0, y = 0, inputs = [0, 0, 0], outputs = [], activeLine = null, active = false }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x="0" y="0" width="80" height="120" rx="6"
        fill={active ? 'rgba(99,102,241,0.1)' : '#131e36'}
        stroke={active ? '#6366f1' : '#334155'}
        strokeWidth="2"
      />
      <text x="40" y="16" fontSize="10" fill={active ? '#a5b4fc' : '#94a3b8'} fontFamily="monospace" textAnchor="middle" fontWeight="bold">DECODER</text>
      <text x="40" y="28" fontSize="8" fill="#64748b" fontFamily="monospace" textAnchor="middle">3-to-8</text>

      {/* Inputs */}
      {inputs.map((inp, i) => (
        <g key={`in${i}`}>
          <line x1="-12" y1={45 + i * 16} x2="0" y2={45 + i * 16}
            stroke={inp ? '#22d3ee' : '#475569'} strokeWidth="1.5"
          />
          <text x="-16" y={48 + i * 16} fontSize="7" fill="#64748b" fontFamily="monospace" textAnchor="end">A{2 - i}</text>
        </g>
      ))}

      {/* Outputs */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <g key={`out${i}`}>
          <line x1="80" y1={36 + i * 10} x2="96" y2={36 + i * 10}
            stroke={activeLine === i ? '#22d3ee' : '#475569'} strokeWidth="1.5"
          />
          <circle cx="98" cy={36 + i * 10} r="2.5"
            fill={activeLine === i ? '#10b981' : '#1e293b'}
            stroke={activeLine === i ? '#34d399' : '#334155'}
            strokeWidth="1"
          />
          <text x="104" y={39 + i * 10} fontSize="6" fill={activeLine === i ? '#6ee7b7' : '#475569'} fontFamily="monospace">Y{i}</text>
        </g>
      ))}
    </g>
  );
}

/**
 * Counter Block
 */
export function CounterBlock({ x = 0, y = 0, count = 0, binaryString = '0000', label = '', active = false }) {
  const bits = binaryString.split('').map(Number);
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x="0" y="0" width="90" height="55" rx="6"
        fill={active ? 'rgba(245,158,11,0.1)' : '#131e36'}
        stroke={active ? '#f59e0b' : '#334155'}
        strokeWidth="2"
      />
      <text x="45" y="14" fontSize="8" fill={active ? '#fcd34d' : '#94a3b8'} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
        {label || 'COUNTER'}
      </text>
      {/* Binary display */}
      {bits.map((b, i) => (
        <g key={i}>
          <rect x={10 + i * 18} y="22" width="14" height="14" rx="2"
            fill={b ? 'rgba(16,185,129,0.2)' : '#0f172a'}
            stroke={b ? '#10b981' : '#334155'}
            strokeWidth="1"
          />
          <text x={17 + i * 18} y="33" fontSize="9" fill={b ? '#6ee7b7' : '#475569'} fontFamily="monospace" textAnchor="middle" fontWeight="bold">{b}</text>
        </g>
      ))}
      {/* Decimal */}
      <text x="45" y="50" fontSize="9" fill={active ? '#fbbf24' : '#64748b'} fontFamily="monospace" textAnchor="middle">= {count}</text>
    </g>
  );
}

/**
 * Wire/Connection Line
 */
export function Wire({ x1, y1, x2, y2, active = false, via = null }) {
  if (via) {
    // L-shaped wire through a via point
    const d = `M ${x1} ${y1} L ${via[0]} ${via[1]} L ${x2} ${y2}`;
    return (
      <path d={d}
        className={active ? 'wire-path active' : 'wire-path inactive'}
        strokeWidth="1.5"
      />
    );
  }
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      className={active ? 'wire-path active' : 'wire-path inactive'}
      strokeWidth="1.5"
    />
  );
}

/**
 * Signal Label
 */
export function SignalLabel({ x, y, text, value, active = false }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-2" y="-10" width={text.length * 6.5 + 8} height="14" rx="3"
        fill={active ? 'rgba(16,185,129,0.15)' : 'rgba(15,23,42,0.8)'}
        stroke={active ? '#10b981' : '#334155'}
        strokeWidth="0.5"
      />
      <text x="2" y="0" fontSize="8" fill={active ? '#6ee7b7' : '#64748b'} fontFamily="monospace">
        {text}{value !== undefined ? `=${value}` : ''}
      </text>
    </g>
  );
}
