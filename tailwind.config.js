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
        pitch:  '#04091e',   // dark navy (card bg)
        grass:  '#0d1f3d',   // navy (borders inside dark cards)
        lime:   '#c41230',   // WC RED — primary CTA buttons
        gold:   '#f5c842',   // WC gold — headings/accents
        red:    '#c41230',   // WC crimson
        muted:  '#7a8fb0',   // blue-grey (inside dark cards)
        // light-mode equivalents
        'surface': '#ffffff',
        'border':  '#dde3f0',
        'ink':     '#111827',   // near-black for text on white backgrounds
      },
    },
  },
  plugins: [],
}
