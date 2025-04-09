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
      backgroundImage: {
        'blue-circle': "url('/src/assets/images/blue-circle.png')",
        'blue-wave': "url('/src/assets/images/blue-wave.png')",
        'yellow-dots': "url('/src/assets/images/yellow-dots.png')",
        'yellow-wave': "url('/src/assets/images/yellow-wave.png')",
      },
    },
  },
  plugins: [],
}