/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#B71C1C',
          green: '#1B5E20',
          gold: '#FFD700',
          white: '#F2F2F2',
        }
      },
      fontFamily: {
        christmas: ['"Mountains of Christmas"', 'cursive'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
