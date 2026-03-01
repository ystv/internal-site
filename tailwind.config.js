const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./stories/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      colors: {
        light: "#fbfbfb",
        dark: "#333333",
        "primary-2": "#74b5ff",
        primary: "#227ee4",
        "primary-4": "#2847cd",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
    require("tailwindcss-animate"),
  ],
  darkMode: ["class", '[data-mantine-color-scheme="dark"]'],
};
