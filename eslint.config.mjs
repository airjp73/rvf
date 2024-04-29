import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    // ignorePatterns: [
    //   "node_modules/",
    //   ".cache/",
    //   "browser/",
    //   "build/",
    //   "test-app/build",
    //   "test-app/remix-validated-form",
    //   "sample-app/build",
    //   "sample-app/remix-validated-form",
    // ],
    // extends: ["react-app"],
    plugins: ["prettier", "no-only-tests"],
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
      "no-only-tests/no-only-tests": "error",
    },
    overrides: [
      {
        files: ["./cypress/**"],
        rules: {
          "@typescript-eslint/no-unused-expressions": "off",
        },
      },
    ],
  },
];
