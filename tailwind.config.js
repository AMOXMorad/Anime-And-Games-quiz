/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        utopia: {
          dark: '#000000',      // Pure Black
          card: '#080c14',      // Deep pitch black card
          cardSub: '#0d1322',   // Secondary dark card
          border: '#162032',    // Subtle dark border
          lightBg: '#ffffff',   // Pure White
          lightCard: '#f8fafc', // Clean Light Card
          lightBorder: '#e2e8f0',
          accent: '#0ea5e9',    // Sky Blue
          cyan: '#06b6d4',      // Electric Cyan
          azure: '#0284c7',     // Deep Azure
          neon: '#38bdf8',      // Bright Sky Neon
          gold: '#f59e0b',
          crimson: '#ef4444',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        gaming: ['Rajdhani', 'Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))' },
          '50%': { opacity: '.7', filter: 'drop-shadow(0 0 5px rgba(6, 182, 212, 0.2))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
