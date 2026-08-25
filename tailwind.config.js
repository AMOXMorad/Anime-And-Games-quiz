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
          dark: '#0a0b10',
          card: '#121420',
          border: '#1f2438',
          accent: '#8b5cf6',
          neon: '#06b6d4',
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
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.6))' },
          '50%': { opacity: '.7', filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.2))' },
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
