/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        logic: {
          dark: '#070b14',
          panel: '#0d1527',
          card: '#131e36',
          border: '#1e293b',
          glow: '#00ff88',
          high: '#10b981',
          low: '#334155',
          clock: '#06b6d4',
          accent: '#6366f1',
          warning: '#f59e0b'
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', 'JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wire-flow': 'wireFlow 1s linear infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.8))' },
          '50%': { opacity: 0.6, filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.3))' },
        },
        wireFlow: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' }
        }
      }
    },
  },
  plugins: [],
}
