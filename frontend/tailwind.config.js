/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#a78bfa',
          600: '#38bdf8',
          900: '#4c1d95',
          dark: '#0f172a',
          darker: '#020617',
          accent: '#38bdf8',
        }
      }
    },
  },
  plugins: [],
}
