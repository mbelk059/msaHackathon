/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        critical: '#EF4444',
        high: '#F97316',
        medium: '#EAB308',
        low: '#22C55E',
      },
      fontFamily: {
        sans: ['Droid Sans', 'sans-serif'],
        serif: ['Tangerine', 'serif'],
        mono: ['Inconsolata', 'monospace'],
      },
    },
  },
  plugins: [],
}
