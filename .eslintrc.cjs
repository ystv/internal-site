/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  ignorePatterns: [".eslintrc.js", "lib/db/types/**/*"],
  extends: ["next/core-web-vitals", "prettier", "plugin:storybook/recommended"],
  plugins: [
    "@typescript-eslint",
    "eslint-plugin-unused-imports",
    "eslint-plugin-react",
  ],
  rules: {
    "@next/next/no-async-client-component": "error",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
};

module.exports = config;
