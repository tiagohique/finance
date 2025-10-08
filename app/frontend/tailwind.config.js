/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f9ff',
          100: '#e0f0ff',
          200: '#b9deff',
          300: '#83c4ff',
          400: '#4ca6ff',
          500: '#1f87ff',
          600: '#0d66d9',
          700: '#0a4faf',
          800: '#0c448f',
          900: '#0f3a74',
        },
      },
    },
  },
  plugins: [],
}
