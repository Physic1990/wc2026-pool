/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bebas Neue', 'cursive'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        pitch: '#0a1a0f',
        grass: '#1a3a24',
        lime: '#c8f135',
        gold: '#f5c842',
        red: '#e63946',
        muted: '#4a5e50',
      },
    },
  },
  plugins: [],
}
