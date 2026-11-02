import React, { useState } from 'react';
import { Home, Settings, Vote, Cpu, BarChart3, BookOpen, Menu, X } from 'lucide-react';

const navItems = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'setup', label: 'Election Setup', Icon: Settings },
  { key: 'voting', label: 'Voting Machine', Icon: Vote },
  { key: 'circuit', label: 'Circuit Visualization', Icon: Cpu },
  { key: 'results', label: 'Results Dashboard', Icon: BarChart3 },
  { key: 'learning', label: 'DLD Learning Center', Icon: BookOpen },
];

export default function Navbar({ currentPage, navigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (key) => {
    navigate(key);
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-logic-dark/95 backdrop-blur-xl border-b border-logic-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 group"
          >
            {/* Circuit icon SVG */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              {/* Outer rounded square */}
              <rect
                x="2"
                y="2"
                width="28"
                height="28"
                rx="6"
                className="stroke-emerald-500"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Inner chip body */}
              <rect
                x="9"
                y="9"
                width="14"
                height="14"
                rx="2"
                className="fill-emerald-500/20 stroke-emerald-400"
                strokeWidth="1"
              />
              {/* Pins top */}
              <line x1="13" y1="2" x2="13" y2="9" className="stroke-emerald-500" strokeWidth="1.2" />
              <line x1="19" y1="2" x2="19" y2="9" className="stroke-emerald-500" strokeWidth="1.2" />
              {/* Pins bottom */}
              <line x1="13" y1="23" x2="13" y2="30" className="stroke-emerald-500" strokeWidth="1.2" />
              <line x1="19" y1="23" x2="19" y2="30" className="stroke-emerald-500" strokeWidth="1.2" />
              {/* Pins left */}
              <line x1="2" y1="13" x2="9" y2="13" className="stroke-emerald-500" strokeWidth="1.2" />
              <line x1="2" y1="19" x2="9" y2="19" className="stroke-emerald-500" strokeWidth="1.2" />
              {/* Pins right */}
              <line x1="23" y1="13" x2="30" y2="13" className="stroke-emerald-500" strokeWidth="1.2" />
              <line x1="23" y1="19" x2="30" y2="19" className="stroke-emerald-500" strokeWidth="1.2" />
              {/* Center dot */}
              <circle cx="16" cy="16" r="2" className="fill-emerald-400" />
            </svg>

            <span className="text-sm sm:text-base font-semibold text-gray-100 group-hover:text-emerald-400 transition-colors whitespace-nowrap">
              DLD Voting Machine Simulator
            </span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={`nav-link${currentPage === key ? ' active' : ''}`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-logic-card transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-logic-border bg-logic-dark/98 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => handleNav(key)}
                className={`nav-link w-full justify-start${currentPage === key ? ' active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
