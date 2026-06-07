/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#1E293B",
        accent: "#06B6D4",
        background: "#0F172A",
      },
    },
  },
  plugins: [],
}
