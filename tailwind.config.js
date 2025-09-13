// tailwind.config.js
module.exports = {
  darkMode: "class", // <--- WICHTIG für Toggle Dark/Light
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
