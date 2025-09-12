// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };

// tailwind.config.js
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        quickaid: {
          primary: "#1a202c", // Sidebar bg, headings
          secondary: "#2d3748", // Borders, secondary text
          accent: "#38b2ac", // CTAs, highlights
          bg: "#f7fafc", // App background
          surface: "#ffffff", // Cards, header, modals
          text: {
            primary: "#2d3748",
            secondary: "#a0aec0",
          },
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        quickaid: {
          primary: "#1a202c",
          secondary: "#2d3748",
          accent: "#38b2ac",
          neutral: "#2d3748",
          "base-100": "#f7fafc",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
      {
        quickaiddark: {
          primary: "#f7fafc",
          secondary: "#a0aec0",
          accent: "#38b2ac",
          neutral: "#2d3748",
          "base-100": "#1a202c",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
      {
        highcontrast: {
          primary: "#000000",
          secondary: "#000000",
          accent: "#ffff00",
          neutral: "#000000",
          "base-100": "#ffffff",
          info: "#0000ff",
          success: "#00ff00",
          warning: "#ff9900",
          error: "#ff0000",
        },
      },
    ],
  },
};
