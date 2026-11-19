/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0a0e27', deep: '#05070f', ocean: '#0f1f4e' },
        cyan: { glow: '#5fe9ff', dim: '#3a7fa0' },
        turquoise: '#2dd4bf',
        coral: '#ff7a8a',
        lavender: '#c7b8ff',
        ink: '#e8ecff',
        muted: '#8b95c7',
        note: {
          pink: '#ffb3c6',
          lavender: '#d8ccff',
          cyan: '#9fe7ff',
          yellow: '#ffe9a8',
        },
      },
      fontFamily: {
        arcade: ['"Press Start 2P"', 'monospace'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(95, 233, 255, 0.25)',
        coral: '0 0 20px rgba(255, 122, 138, 0.3)',
      },
    },
  },
  plugins: [],
};
