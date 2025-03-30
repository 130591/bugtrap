// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9B4D96', // Roxo Claro
        secondary: '#6A1B9A', // Roxo Escuro
        accent: '#FF8C00', // Laranja Claro
        accentDark: '#F57C00', // Laranja Escuro
      },
    },
  },
  plugins: [],
}
