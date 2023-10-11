const plugin = require("tailwindcss/plugin");

const mantineVariantsPlugin = plugin(function ({ addVariant }) {
  addVariant("success", `&[data-variant="success"]`);
  addVariant("danger", `&[data-variant="danger"]`);
  addVariant("warning", `&[data-variant="warning"]`);
});

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
        "success-2": "#81e654",
        success: "#2fc930",
        "success-4": "#2a8323",
        "warning-2": "#fd7f3e",
        warning: "#f4650e",
        "warning-4": "#dd4602",
        "danger-2": "#eb4141",
        danger: "#e80708",
        "danger-4": "#b20000",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
    require("tailwindcss-animate"),
    mantineVariantsPlugin,
  ],
  darkMode: ["class", '[data-mantine-color-scheme="dark"]'],
};
