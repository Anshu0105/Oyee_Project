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
        discord: {
          gray: '#36393f',
          dark: '#202225',
          darker: '#2f3136',
          light: '#40444b',
          brand: '#5865F2',
          brand_hover: '#4752c4',
        }
      }
    },
  },
  plugins: [],
}
