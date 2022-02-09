/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  ignorePatterns: [
    "node_modules/",
    ".cache/",
    "browser/",
    "build/",
    "test-app/build",
    "test-app/remix-validated-form",
    "sample-app/build",
    "sample-app/remix-validated-form",
  ],
  extends: ["react-app"],
  plugins: ["prettier", "lodash"],
  rules: {
    "import/no-anonymous-default-export": "off",
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "unknown",
          "parent",
          "sibling",
          "index",
        ],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        "newlines-between": "never",
      },
    ],
    "prettier/prettier": "error",
    "lodash/import-scope": "error",
  },
  overrides: [
    {
      files: ["./cypress/**"],
      rules: {
        "@typescript-eslint/no-unused-expressions": "off",
      },
    },
  ],
};
