module.exports = {
  rules: {
    "no-restricted-imports": "off",
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@/*"],
            message:
              "@-imports won't work in the server bundle, use normal relative imports.",
            allowTypeImports: false,
          },
        ],
      },
    ],
  },
};
