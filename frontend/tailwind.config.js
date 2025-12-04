/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: '#009B4D', // Green
          secondary: '#FFCC00', // Tangerine Yellow
          accent: '#FAF5E9', // Ivory
          dark: '#1a1a1a',
        }
      },
    },
    plugins: [],
  }
  