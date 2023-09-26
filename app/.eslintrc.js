module.exports = {
  rules: {
    "no-restricted-imports": "off",
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        patterns: [{
          group: ["@/lib/db", "@/lib/adamrms*"],
          message: "Please use @/features instead",
          allowTypeImports: false,
        }],
      },
    ],
  },
};
