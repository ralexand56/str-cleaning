/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        marcellus: ['Marcellus_400Regular'],
      },
      colors: {
        stone:        '#f4f0ea',
        muted:        '#d8cec2',
        accent:       '#c8b39a',
        'dark-brown': '#44362a',
        'bg-dark':    '#1d1814',
      },
    },
  },
  plugins: [],
}
