import React, { useEffect, useRef } from 'react';
import {
  Zap, Cpu, Monitor, Database, BarChart3, Play,
  BookOpen, ArrowRight, Binary, CircuitBoard, Clock,
  Shield, Layers, Eye, GraduationCap, ChevronRight
} from 'lucide-react';

/* ─── Animated Circuit Background ─────────────────────────────── */
function CircuitBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wireGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="wireGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal animated wires */}
        <line x1="0" y1="120" x2="100%" y2="120" stroke="url(#wireGrad1)" strokeWidth="1">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite" />
        </line>
        <line x1="0" y1="300" x2="100%" y2="300" stroke="url(#wireGrad1)" strokeWidth="1">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="5s" repeatCount="indefinite" />
        </line>
        <line x1="0" y1="500" x2="100%" y2="500" stroke="url(#wireGrad1)" strokeWidth="1">
          <animate attributeName="opacity" values="0.15;0.5;0.15" dur="6s" repeatCount="indefinite" />
        </line>

        {/* Vertical animated wires */}
        <line x1="15%" y1="0" x2="15%" y2="100%" stroke="url(#wireGrad2)" strokeWidth="1">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="7s" repeatCount="indefinite" />
        </line>
        <line x1="85%" y1="0" x2="85%" y2="100%" stroke="url(#wireGrad2)" strokeWidth="1">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="5.5s" repeatCount="indefinite" />
        </line>

        {/* Decorative AND gate shape — top-left region */}
        <g transform="translate(80, 60)" opacity="0.12">
          <path d="M0,0 L20,0 C35,0 40,10 40,20 C40,30 35,40 20,40 L0,40 Z" stroke="#10b981" strokeWidth="1.5" fill="none" />
          <line x1="-15" y1="12" x2="0" y2="12" stroke="#10b981" strokeWidth="1" />
          <line x1="-15" y1="28" x2="0" y2="28" stroke="#10b981" strokeWidth="1" />
          <line x1="40" y1="20" x2="55" y2="20" stroke="#10b981" strokeWidth="1" />
          <animate attributeName="opacity" values="0.08;0.18;0.08" dur="4s" repeatCount="indefinite" />
        </g>

        {/* Decorative OR gate shape — bottom-right region */}
        <g transform="translate(85%, 70%)" opacity="0.1">
          <path d="M0,0 Q10,20 0,40 Q25,35 40,20 Q25,5 0,0 Z" stroke="#06b6d4" strokeWidth="1.5" fill="none" />
          <line x1="-15" y1="12" x2="5" y2="12" stroke="#06b6d4" strokeWidth="1" />
          <line x1="-15" y1="28" x2="5" y2="28" stroke="#06b6d4" strokeWidth="1" />
          <line x1="40" y1="20" x2="55" y2="20" stroke="#06b6d4" strokeWidth="1" />
          <animate attributeName="opacity" values="0.06;0.15;0.06" dur="5s" repeatCount="indefinite" />
        </g>

        {/* NOT gate triangle — mid-left */}
        <g transform="translate(5%, 45%)" opacity="0.1">
          <polygon points="0,0 30,15 0,30" stroke="#10b981" strokeWidth="1.2" fill="none" />
          <circle cx="34" cy="15" r="3" stroke="#10b981" strokeWidth="1" fill="none" />
          <line x1="-12" y1="15" x2="0" y2="15" stroke="#10b981" strokeWidth="1" />
          <line x1="37" y1="15" x2="50" y2="15" stroke="#10b981" strokeWidth="1" />
          <animate attributeName="opacity" values="0.06;0.16;0.06" dur="6s" repeatCount="indefinite" />
        </g>

        {/* Signal dots moving along paths */}
        <circle r="2.5" fill="#10b981" filter="url(#glowFilter)">
          <animateMotion dur="6s" repeatCount="indefinite" path="M0,120 L1400,120" />
          <animate attributeName="opacity" values="0;0.8;0" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle r="2" fill="#06b6d4" filter="url(#glowFilter)">
          <animateMotion dur="8s" repeatCount="indefinite" path="M1400,300 L0,300" />
          <animate attributeName="opacity" values="0;0.7;0" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle r="2" fill="#10b981" filter="url(#glowFilter)">
          <animateMotion dur="7s" repeatCount="indefinite" path="M0,500 L1400,500" />
          <animate attributeName="opacity" values="0;0.6;0" dur="7s" repeatCount="indefinite" />
        </circle>

        {/* Junction dots at wire crossings */}
        <circle cx="15%" cy="120" r="3" fill="#10b981" opacity="0.15">
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="85%" cy="300" r="3" fill="#06b6d4" opacity="0.15">
          <animate attributeName="opacity" values="0.1;0.25;0.1" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="15%" cy="500" r="3" fill="#10b981" opacity="0.12">
          <animate attributeName="opacity" values="0.08;0.22;0.08" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Radial gradient overlays */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
    </div>
  );
}

/* ─── Small SVG Illustrations for "How It Works" Cards ────────── */

function InputButtonSVG() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="10" width="48" height="44" rx="6" stroke="#10b981" strokeWidth="1.5" fill="#10b98110" />
      <rect x="14" y="18" width="36" height="8" rx="3" stroke="#10b981" strokeWidth="1" fill="#10b98120" />
      <rect x="14" y="30" width="36" height="8" rx="3" stroke="#34d399" strokeWidth="1" fill="#34d39930">
        <animate attributeName="fill" values="#34d39930;#34d39960;#34d39930" dur="2s" repeatCount="indefinite" />
      </rect>
      <rect x="14" y="42" width="36" height="8" rx="3" stroke="#10b981" strokeWidth="1" fill="#10b98120" />
      <circle cx="48" cy="34" r="3" fill="#10b981">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="20" y="25" fontSize="6" fill="#94a3b8" fontFamily="monospace">BTN 1</text>
      <text x="20" y="37" fontSize="6" fill="#34d399" fontFamily="monospace" fontWeight="bold">BTN 2</text>
      <text x="20" y="49" fontSize="6" fill="#94a3b8" fontFamily="monospace">BTN 3</text>
    </svg>
  );
}

function EncoderSVG() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="6" width="28" height="52" rx="4" stroke="#10b981" strokeWidth="1.5" fill="#10b98110" />
      <text x="22" y="35" fontSize="7" fill="#10b981" fontFamily="monospace" fontWeight="bold">ENC</text>
      {/* Input lines */}
      {[14, 22, 30, 38, 46].map((y, i) => (
        <g key={i}>
          <line x1="4" y1={y} x2="18" y2={y} stroke={i === 2 ? '#34d399' : '#475569'} strokeWidth="1.5">
            {i === 2 && <animate attributeName="stroke" values="#34d399;#6ee7b7;#34d399" dur="1.5s" repeatCount="indefinite" />}
          </line>
          <circle cx="4" cy={y} r="2" fill={i === 2 ? '#34d399' : '#334155'} />
        </g>
      ))}
      {/* Output lines */}
      {[22, 32, 42].map((y, i) => (
        <g key={i}>
          <line x1="46" y1={y} x2="60" y2={y} stroke="#34d399" strokeWidth="1.5">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
          </line>
          <circle cx="60" cy={y} r="2" fill="#34d399">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      <text x="20" y="56" fontSize="5" fill="#64748b" fontFamily="monospace">8→3</text>
    </svg>
  );
}

function LogicGateSVG() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* AND gate */}
      <g transform="translate(12, 6)">
        <path d="M0,0 L15,0 C28,0 30,10 30,12 C30,14 28,24 15,24 L0,24 Z" stroke="#10b981" strokeWidth="1.2" fill="#10b98110" />
        <line x1="-8" y1="8" x2="0" y2="8" stroke="#34d399" strokeWidth="1.2" />
        <line x1="-8" y1="16" x2="0" y2="16" stroke="#34d399" strokeWidth="1.2" />
        <line x1="30" y1="12" x2="40" y2="12" stroke="#34d399" strokeWidth="1.2" />
        <text x="7" y="14" fontSize="6" fill="#10b981" fontFamily="monospace">&amp;</text>
      </g>
      {/* OR gate */}
      <g transform="translate(12, 36)">
        <path d="M0,0 Q8,12 0,24 Q18,20 30,12 Q18,4 0,0 Z" stroke="#06b6d4" strokeWidth="1.2" fill="#06b6d410" />
        <line x1="-8" y1="8" x2="4" y2="8" stroke="#22d3ee" strokeWidth="1.2" />
        <line x1="-8" y1="16" x2="4" y2="16" stroke="#22d3ee" strokeWidth="1.2" />
        <line x1="30" y1="12" x2="40" y2="12" stroke="#22d3ee" strokeWidth="1.2" />
        <text x="8" y="15" fontSize="6" fill="#06b6d4" fontFamily="monospace">≥1</text>
      </g>
      {/* Signal flow arrow */}
      <g opacity="0.6">
        <line x1="52" y1="18" x2="52" y2="48" stroke="#475569" strokeWidth="1" strokeDasharray="3 3">
          <animate attributeName="strokeDashoffset" values="6;0" dur="1s" repeatCount="indefinite" />
        </line>
      </g>
    </svg>
  );
}

function FlipFlopSVG() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="8" width="36" height="48" rx="4" stroke="#10b981" strokeWidth="1.5" fill="#10b98110" />
      {/* D input */}
      <line x1="2" y1="22" x2="14" y2="22" stroke="#34d399" strokeWidth="1.5" />
      <text x="16" y="25" fontSize="7" fill="#34d399" fontFamily="monospace" fontWeight="bold">D</text>
      {/* Clock input with triangle */}
      <line x1="2" y1="42" x2="14" y2="42" stroke="#f59e0b" strokeWidth="1.5" />
      <polygon points="14,38 22,42 14,46" fill="none" stroke="#f59e0b" strokeWidth="1" />
      <text x="24" y="45" fontSize="6" fill="#f59e0b" fontFamily="monospace">CLK</text>
      {/* Q output */}
      <line x1="50" y1="22" x2="62" y2="22" stroke="#34d399" strokeWidth="1.5" />
      <text x="40" y="25" fontSize="7" fill="#34d399" fontFamily="monospace" fontWeight="bold">Q</text>
      {/* Q-bar output */}
      <line x1="50" y1="42" x2="62" y2="42" stroke="#64748b" strokeWidth="1.5" />
      <text x="38" y="45" fontSize="7" fill="#94a3b8" fontFamily="monospace">Q̄</text>
      {/* Clock pulse animation */}
      <rect x="18" y="50" width="28" height="4" rx="1" fill="none" stroke="#475569" strokeWidth="0.5">
        <animate attributeName="stroke" values="#475569;#f59e0b;#475569" dur="1.5s" repeatCount="indefinite" />
      </rect>
      {/* Clock waveform */}
      <polyline points="20,53 24,53 24,51 28,51 28,53 32,53 32,51 36,51 36,53 40,53 40,51 44,51 44,53" stroke="#f59e0b" strokeWidth="0.8" fill="none" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
      </polyline>
    </svg>
  );
}

function CounterSVG() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="10" width="48" height="44" rx="5" stroke="#10b981" strokeWidth="1.5" fill="#10b98110" />
      <text x="13" y="24" fontSize="6" fill="#64748b" fontFamily="monospace">COUNT</text>
      {/* 4-bit display boxes */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${12 + i * 11}, 28)`}>
          <rect width="9" height="16" rx="2" stroke={i < 2 ? '#334155' : '#10b981'} strokeWidth="1" fill={i < 2 ? '#1e293b' : '#10b98120'} />
          <text x="4.5" y="11" fontSize="8" fill={i < 2 ? '#475569' : '#34d399'} fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            {i < 2 ? '0' : '1'}
          </text>
        </g>
      ))}
      {/* +1 indicator */}
      <text x="32" y="54" textAnchor="middle" fontSize="7" fill="#10b981" fontFamily="monospace" fontWeight="bold">
        +1
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.2s" repeatCount="indefinite" />
      </text>
    </svg>
  );
}

function SevenSegSVG() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="52" height="52" rx="6" stroke="#10b981" strokeWidth="1.2" fill="#0f172a" />
      {/* 7-segment digit display for "5" */}
      <g transform="translate(20, 12)">
        {/* Segment a (top) */}
        <rect x="5" y="0" width="14" height="3" rx="1" fill="#10b981">
          <animate attributeName="fill" values="#10b981;#34d399;#10b981" dur="3s" repeatCount="indefinite" />
        </rect>
        {/* Segment b (top-right) */}
        <rect x="19" y="4" width="3" height="14" rx="1" fill="#1e293b" />
        {/* Segment c (bottom-right) */}
        <rect x="19" y="22" width="3" height="14" rx="1" fill="#10b981">
          <animate attributeName="fill" values="#10b981;#34d399;#10b981" dur="3s" repeatCount="indefinite" />
        </rect>
        {/* Segment d (bottom) */}
        <rect x="5" y="36" width="14" height="3" rx="1" fill="#10b981">
          <animate attributeName="fill" values="#10b981;#34d399;#10b981" dur="3s" repeatCount="indefinite" />
        </rect>
        {/* Segment e (bottom-left) */}
        <rect x="2" y="22" width="3" height="14" rx="1" fill="#1e293b" />
        {/* Segment f (top-left) */}
        <rect x="2" y="4" width="3" height="14" rx="1" fill="#10b981">
          <animate attributeName="fill" values="#10b981;#34d399;#10b981" dur="3s" repeatCount="indefinite" />
        </rect>
        {/* Segment g (middle) */}
        <rect x="5" y="18" width="14" height="3" rx="1" fill="#10b981">
          <animate attributeName="fill" values="#10b981;#34d399;#10b981" dur="3s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
}

/* ─── How It Works Card Data ──────────────────────────────────── */
const howItWorksCards = [
  {
    step: 1,
    title: 'Select Candidate',
    description: 'Input buttons generate a one-hot binary vector — only the selected candidate\'s line goes HIGH (1).',
    Illustration: InputButtonSVG,
    color: 'emerald',
  },
  {
    step: 2,
    title: 'Encoder Circuit',
    description: 'An 8-to-3 priority encoder converts the one-hot input into a compact 3-bit binary code.',
    Illustration: EncoderSVG,
    color: 'emerald',
  },
  {
    step: 3,
    title: 'Logic Gates',
    description: 'AND, OR, and NOT gates validate the vote — checking selection, enable signal, and lock status.',
    Illustration: LogicGateSVG,
    color: 'cyan',
  },
  {
    step: 4,
    title: 'D Flip-Flop',
    description: 'Edge-triggered D flip-flops latch the validated binary code on the rising clock edge.',
    Illustration: FlipFlopSVG,
    color: 'amber',
  },
  {
    step: 5,
    title: 'Binary Counter',
    description: 'A 4-bit synchronous counter increments the selected candidate\'s vote tally.',
    Illustration: CounterSVG,
    color: 'emerald',
  },
  {
    step: 6,
    title: '7-Segment Display',
    description: 'BCD-to-7-segment decoders drive LED displays to show each candidate\'s total votes.',
    Illustration: SevenSegSVG,
    color: 'emerald',
  },
];

/* ─── Technology Stack Data ───────────────────────────────────── */
const techStack = [
  {
    name: 'React',
    desc: 'Frontend UI',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <ellipse cx="14" cy="14" rx="12" ry="4.5" stroke="#61dafb" strokeWidth="1.2" transform="rotate(0 14 14)" />
        <ellipse cx="14" cy="14" rx="12" ry="4.5" stroke="#61dafb" strokeWidth="1.2" transform="rotate(60 14 14)" />
        <ellipse cx="14" cy="14" rx="12" ry="4.5" stroke="#61dafb" strokeWidth="1.2" transform="rotate(120 14 14)" />
        <circle cx="14" cy="14" r="2.2" fill="#61dafb" />
      </svg>
    ),
  },
  {
    name: 'Node.js',
    desc: 'Backend API',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 2L25 8.5V19.5L14 26L3 19.5V8.5L14 2Z" stroke="#68a063" strokeWidth="1.3" fill="#68a06315" />
        <text x="14" y="17" textAnchor="middle" fontSize="8" fill="#68a063" fontWeight="bold" fontFamily="monospace">N</text>
      </svg>
    ),
  },
  {
    name: 'MongoDB',
    desc: 'Database',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3C14 3 8 9 8 16C8 21 10.5 25 14 25C17.5 25 20 21 20 16C20 9 14 3 14 3Z" stroke="#00ed64" strokeWidth="1.3" fill="#00ed6415" />
        <line x1="14" y1="10" x2="14" y2="23" stroke="#00ed64" strokeWidth="1" />
      </svg>
    ),
  },
  {
    name: 'Tailwind',
    desc: 'Styling',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M8 12C9.5 7 12.5 6 14 6C18 6 18.5 10 22 10C24 10 25 9 26 7C24.5 12 21.5 13 20 13C16 13 15.5 9 12 9C10 9 9 10 8 12Z" fill="#38bdf8" opacity="0.8" />
        <path d="M2 19C3.5 14 6.5 13 8 13C12 13 12.5 17 16 17C18 17 19 16 20 14C18.5 19 15.5 20 14 20C10 20 9.5 16 6 16C4 16 3 17 2 19Z" fill="#38bdf8" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: 'Chart.js',
    desc: 'Visualization',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="16" width="4" height="8" rx="1" fill="#f472b6" opacity="0.7" />
        <rect x="10" y="10" width="4" height="14" rx="1" fill="#a78bfa" opacity="0.7" />
        <rect x="16" y="6" width="4" height="18" rx="1" fill="#34d399" opacity="0.7" />
        <rect x="22" y="12" width="4" height="12" rx="1" fill="#fbbf24" opacity="0.7" />
      </svg>
    ),
  },
];

/* ─── Feature List Data ───────────────────────────────────────── */
const features = [
  {
    Icon: Eye,
    title: 'Real-time Circuit Animation',
    description: 'Watch signals propagate through every gate, flip-flop, and decoder in real time.',
  },
  {
    Icon: Layers,
    title: 'Step-by-Step Mode',
    description: 'Slow down the clock and trace each stage of the voting pipeline individually.',
  },
  {
    Icon: Shield,
    title: 'Interactive Voting',
    description: 'Cast votes on a realistic EVM interface and see the underlying digital circuitry respond.',
  },
  {
    Icon: GraduationCap,
    title: 'DLD Education',
    description: 'Comprehensive learning modules covering encoders, decoders, flip-flops, counters, and more.',
  },
];

/* ─── Main HomePage Component ─────────────────────────────────── */
export default function HomePage({ navigate }) {
  const heroRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-logic-dark circuit-board-bg relative">
      <CircuitBackground />

      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={heroRef}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8">
            <CircuitBoard size={14} />
            <span>Digital Logic Design — Educational Simulator</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-100 leading-tight tracking-tight mb-6">
            Interactive{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Digital Voting Machine
            </span>{' '}
            Simulator
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Explore how a real Electronic Voting Machine works at the gate level.
            Learn encoders, decoders, flip-flops, counters, and seven-segment displays
            through an interactive, hands-on simulation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('setup')}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play size={22} className="group-hover:scale-110 transition-transform" />
              Start Simulation
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('learning')}
              className="btn-secondary inline-flex items-center gap-2.5 px-7 py-3.5 text-base font-semibold rounded-xl hover:border-emerald-500/40 hover:text-emerald-400"
            >
              <BookOpen size={20} />
              Learn DLD Concepts
            </button>
          </div>

          {/* Decorative binary stream */}
          <div className="mt-12 flex items-center justify-center gap-1 text-xs font-mono text-slate-700 select-none overflow-hidden" aria-hidden="true">
            {Array.from({ length: 32 }, (_, i) => (
              <span
                key={i}
                className={`transition-colors duration-1000 ${
                  i % 7 === 0 || i % 5 === 0 ? 'text-emerald-600/40' : ''
                }`}
              >
                {i % 3 === 0 ? '1' : '0'}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ─────────────────────────────── */}
      <section className="relative py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every vote travels through a complete digital logic pipeline — from button press to display output.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {howItWorksCards.map(({ step, title, description, Illustration, color }) => (
              <div key={step} className="card-glow group relative">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-logic-dark border border-emerald-500/40 flex items-center justify-center text-sm font-bold text-emerald-400 shadow-lg">
                  {step}
                </div>

                {/* Illustration */}
                <div className="flex items-center justify-center mb-4 h-20 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Illustration />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-100 mb-2 flex items-center gap-2">
                  {title}
                  <ChevronRight size={14} className="text-emerald-500/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>

                {/* Wire connector (decorative) */}
                {step < 6 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2">
                    <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
                      <circle cx="3" cy="6" r="2.5" stroke="#10b981" strokeWidth="1" fill="#10b98130" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pipeline flow indicator */}
          <div className="hidden lg:flex items-center justify-center mt-8 gap-2 text-xs font-mono text-slate-600">
            <span className="text-emerald-500/60">INPUT</span>
            <svg width="40" height="8" viewBox="0 0 40 8">
              <line x1="0" y1="4" x2="34" y2="4" stroke="#10b981" strokeWidth="1" strokeDasharray="4 3">
                <animate attributeName="strokeDashoffset" values="7;0" dur="1s" repeatCount="indefinite" />
              </line>
              <polygon points="34,1 40,4 34,7" fill="#10b981" opacity="0.6" />
            </svg>
            <span className="text-emerald-500/60">ENCODE</span>
            <svg width="40" height="8" viewBox="0 0 40 8">
              <line x1="0" y1="4" x2="34" y2="4" stroke="#10b981" strokeWidth="1" strokeDasharray="4 3">
                <animate attributeName="strokeDashoffset" values="7;0" dur="1s" repeatCount="indefinite" />
              </line>
              <polygon points="34,1 40,4 34,7" fill="#10b981" opacity="0.6" />
            </svg>
            <span className="text-cyan-500/60">VALIDATE</span>
            <svg width="40" height="8" viewBox="0 0 40 8">
              <line x1="0" y1="4" x2="34" y2="4" stroke="#10b981" strokeWidth="1" strokeDasharray="4 3">
                <animate attributeName="strokeDashoffset" values="7;0" dur="1s" repeatCount="indefinite" />
              </line>
              <polygon points="34,1 40,4 34,7" fill="#10b981" opacity="0.6" />
            </svg>
            <span className="text-amber-500/60">STORE</span>
            <svg width="40" height="8" viewBox="0 0 40 8">
              <line x1="0" y1="4" x2="34" y2="4" stroke="#10b981" strokeWidth="1" strokeDasharray="4 3">
                <animate attributeName="strokeDashoffset" values="7;0" dur="1s" repeatCount="indefinite" />
              </line>
              <polygon points="34,1 40,4 34,7" fill="#10b981" opacity="0.6" />
            </svg>
            <span className="text-emerald-500/60">COUNT</span>
            <svg width="40" height="8" viewBox="0 0 40 8">
              <line x1="0" y1="4" x2="34" y2="4" stroke="#10b981" strokeWidth="1" strokeDasharray="4 3">
                <animate attributeName="strokeDashoffset" values="7;0" dur="1s" repeatCount="indefinite" />
              </line>
              <polygon points="34,1 40,4 34,7" fill="#10b981" opacity="0.6" />
            </svg>
            <span className="text-emerald-500/60">DISPLAY</span>
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────── */}
      <section className="relative py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
              Key Features
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Built for students, educators, and anyone curious about digital electronics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map(({ Icon, title, description }, idx) => (
              <div key={idx} className="card-glow flex gap-4 items-start group">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-1">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technology Stack Section ──────────────────────────── */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-3">
              Technology Stack
            </h2>
            <p className="text-slate-400 text-sm">
              Powered by modern web technologies for a seamless interactive experience.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {techStack.map(({ name, desc, icon }) => (
              <div
                key={name}
                className="card-glow flex items-center gap-3 px-5 py-3 min-w-[140px]"
              >
                <div className="shrink-0">{icon}</div>
                <div>
                  <div className="text-sm font-semibold text-gray-200">{name}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA Section ────────────────────────────────── */}
      <section className="relative py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card-glow border-emerald-500/20 p-10 sm:p-14">
            <Cpu size={40} className="text-emerald-400 mx-auto mb-6 opacity-60" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-4">
              Ready to explore digital logic?
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Set up an election, cast votes, and watch every signal
              propagate through the circuit in real time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('setup')}
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
              >
                <Zap size={18} />
                Launch Simulator
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('learning')}
                className="btn-secondary inline-flex items-center gap-2 px-6 py-3 rounded-xl hover:border-emerald-500/40 hover:text-emerald-400"
              >
                <BookOpen size={18} />
                Learning Center
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer / Disclaimer ──────────────────────────────── */}
      <footer className="relative py-8 border-t border-logic-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CircuitBoard size={14} className="text-emerald-600/50" />
              <span className="text-slate-500">DLD Voting Machine Simulator</span>
            </div>
            <p className="text-center sm:text-right text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/15 text-amber-400/70">
                <Shield size={12} />
                Educational Simulator — Not a real election system
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
