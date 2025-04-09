/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#2563EB',
          yellow: '#F59E0B',
        },
        error: '#EF4444',
        success: '#10B981',
      },
      fontFamily: {
        sans: ['"SF Mono"', 'monospace'],
      },
      backdropBlur: {
        'md': '10px',
      },
    },
  },
  plugins: [],
}