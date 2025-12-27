/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#9333ea',
        'primary-light': '#a855f7',
        'primary-dark': '#7c3aed',
        secondary: '#06b6d4',
        accent: '#f472b6',
      },
    },
  },
  plugins: [],
}
