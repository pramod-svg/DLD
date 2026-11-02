import React from 'react';

/**
 * Seven-Segment Display SVG Component
 * Renders a single digit using 7-segment display
 */
export default function SevenSegmentDisplay({ segments = {}, digit = null, size = 1, label = '' }) {
  const s = size;
  const w = 44 * s;
  const h = 68 * s;

  const isOn = (seg) => segments[seg] ? true : false;

  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-[10px] text-slate-500 font-mono">{label}</span>}
      <svg width={w} height={h} viewBox="0 0 44 68" className="drop-shadow-lg">
        {/* Background */}
        <rect x="0" y="0" width="44" height="68" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />

        {/* Segment a (top) */}
        <polygon
          points="8,6 14,2 30,2 36,6 30,10 14,10"
          className={isOn('a') ? 'seg-on' : 'seg-off'}
        />
        {/* Segment b (top-right) */}
        <polygon
          points="37,8 41,14 39,30 35,32 33,28 33,12"
          className={isOn('b') ? 'seg-on' : 'seg-off'}
        />
        {/* Segment c (bottom-right) */}
        <polygon
          points="35,36 39,38 41,54 37,60 33,56 33,40"
          className={isOn('c') ? 'seg-on' : 'seg-off'}
        />
        {/* Segment d (bottom) */}
        <polygon
          points="8,62 14,58 30,58 36,62 30,66 14,66"
          className={isOn('d') ? 'seg-on' : 'seg-off'}
        />
        {/* Segment e (bottom-left) */}
        <polygon
          points="7,60 3,54 5,38 9,36 11,40 11,56"
          className={isOn('e') ? 'seg-on' : 'seg-off'}
        />
        {/* Segment f (top-left) */}
        <polygon
          points="9,32 5,30 3,14 7,8 11,12 11,28"
          className={isOn('f') ? 'seg-on' : 'seg-off'}
        />
        {/* Segment g (middle) */}
        <polygon
          points="10,34 14,30 30,30 34,34 30,38 14,38"
          className={isOn('g') ? 'seg-on' : 'seg-off'}
        />
      </svg>
      {digit !== null && (
        <span className="text-xs font-mono text-slate-400">{digit}</span>
      )}
    </div>
  );
}
