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
        pitch: '#04091e',        // deep navy background
        grass: '#0d1f3d',        // card/border navy
        lime: '#f5c842',         // gold — primary accent (buttons, headings, active)
        gold: '#f5c842',         // gold
        red: '#c41230',          // WC crimson red
        muted: '#5a7499',        // muted blue-grey text
      },
    },
  },
  plugins: [],
}
