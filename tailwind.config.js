/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hl: {
          dark: '#111215',
          card: '#181a1f',
          cardHover: '#1f2229',
          border: '#272b35',
          muted: '#8b949e',
          text: '#e6edf3',
          green: '#00e599',
          greenHover: '#00c784',
          greenBg: 'rgba(0, 229, 153, 0.1)',
          red: '#ff4d4f',
          yellow: '#f59e0b',
          purple: '#a855f7',
          cyan: '#06b6d4',
          blue: '#3b82f6'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(0, 229, 153, 0.25), inset 0 0 10px rgba(0, 229, 153, 0.05)',
            borderColor: 'rgba(0, 229, 153, 0.5)'
          },
          '50%': {
            boxShadow: '0 0 28px rgba(0, 229, 153, 0.55), inset 0 0 16px rgba(0, 229, 153, 0.15)',
            borderColor: 'rgba(0, 229, 153, 0.9)'
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        flashGreen: {
          '0%': { backgroundColor: 'rgba(0, 229, 153, 0.35)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(255, 77, 79, 0.35)' },
          '100%': { backgroundColor: 'transparent' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'scale-up': 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'shimmer': 'shimmer 2.5s infinite linear',
        'flash-green': 'flashGreen 0.8s ease-out forwards',
        'flash-red': 'flashRed 0.8s ease-out forwards',
      }
    },
  },
  plugins: [],
}
