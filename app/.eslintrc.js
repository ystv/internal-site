module.exports = {
  rules: {
    "no-restricted-imports": "off",
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        name: "@/lib/db",
        message: "Please use @/features instead",
        allowTypeImports: false,
      },
    ],
  },
};
