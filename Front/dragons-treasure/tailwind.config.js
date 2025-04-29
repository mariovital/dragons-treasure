/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Crossten', 'sans-serif'],
        crossten: ['Crossten', 'sans-serif'],
      },
      colors: {
        'primary-blue': '#0053B1',
        'primary-blue-dark': '#003E85',
        'primary-yellow': '#F6BA27',
        'black-900': '#121212',
      },
    },
  },
  plugins: [],
}