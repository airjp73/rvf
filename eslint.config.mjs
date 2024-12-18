import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import reactRuntimeconfig from "eslint-plugin-react/configs/jsx-runtime.js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "**/node_modules/",
      "**/.cache/",
      "**/browser/",
      "**/build/",
      "**/dist/",
      "**/api/",
      "**/.react-router/",
      //   "test-app/remix-validated-form",
      //   "sample-app/build",
      //   "sample-app/remix-validated-form",
    ],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
    },
  },
  pluginReactConfig,
  reactRuntimeconfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-useless-escape": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "off",
        {
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-var-requires": "off",
      "react/no-unescaped-entities": "off",

      // Turn this on eventually
      "@typescript-eslint/ban-ts-comment": "off",
      "prefer-const": "off",
      "react/no-deprecated": "off",
      "react/display-name": "off",
      "react/prop-types": "off",
    },
  },
];
