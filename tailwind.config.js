/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50: '#fff1f5',
          100: '#ffe4ec',
          200: '#fecdd9',
          300: '#fda4bc',
          400: '#fb7299',
          500: '#f4477d',
          600: '#e02765',
          700: '#bd1c55',
          800: '#9a1849',
          900: '#7e173f',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Space Grotesk',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(60% 60% at 50% 30%, rgba(59,130,246,0.18) 0%, rgba(255,255,255,0) 70%)',
        'gradient-cta':
          'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
        'gradient-text':
          'linear-gradient(120deg, #0f172a 0%, #2563eb 45%, #06b6d4 100%)',
        'gradient-pink':
          'linear-gradient(135deg, #fb7299 0%, #f4477d 100%)',
        'gradient-blue-pink':
          'linear-gradient(135deg, #2563eb 0%, #f4477d 100%)',
        'gradient-soft':
          'linear-gradient(135deg, #eff6ff 0%, #fff1f5 100%)',
      },
      boxShadow: {
        glow: '0 20px 60px -20px rgba(37, 99, 235, 0.45)',
        'glow-cyan': '0 20px 60px -20px rgba(6, 182, 212, 0.45)',
        'glow-pink': '0 20px 60px -20px rgba(244, 71, 125, 0.45)',
        soft: '0 30px 80px -30px rgba(15, 23, 42, 0.18)',
        chic: '0 10px 30px -12px rgba(15, 23, 42, 0.08)',
      },
      animation: {
        'blob-slow': 'blob 18s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.95)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.45)' },
          '50%': { transform: 'scale(1.03)', boxShadow: '0 0 0 14px rgba(37, 99, 235, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
