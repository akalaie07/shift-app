/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // <--- HINZUGEFÜGT
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Quicksand"', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
