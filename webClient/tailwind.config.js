/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        saffron: { 500: "#FF6F1E", 600: "#E85D0F", 700: "#C44A08" },
        zblack: { 800: "#16171A", 900: "#0D0E10" },
      },
    },
  },
  plugins: [],
};
