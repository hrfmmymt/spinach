export default [
  {
    space: 2,
    rules: {
      "@stylistic/quotes": ["error", "double"],
    },
  },
  {
    files: ["browser.js"],
    languageOptions: {
      globals: {
        document: "readonly",
        console: "readonly",
        setInterval: "readonly",
      },
    },
    rules: {
      "unicorn/prefer-module": "off",
    },
  },
];
