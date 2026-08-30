// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/*", "node_modules/*"],
  },
  {
    // Build/tooling scripts run in Node, not in the app bundle.
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        require: "readonly",
        module: "writable",
        process: "readonly",
        console: "readonly",
      },
    },
  },
  {
    // VLFA layer boundaries. presentation -> business-logic -> data-access.
    // A violation here is an architecture bug, not a style nit.
    files: ["src/**/data-access/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/presentation/**", "@/common/presentation/*"],
              message:
                "data-access must not import presentation. It is the bottom layer.",
            },
            {
              group: ["**/business-logic/**", "@/common/business-logic/*"],
              message:
                "data-access must not import business-logic. Invert the dependency (channel or registry).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/business-logic/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/presentation/**", "@/common/presentation/*"],
              message:
                "business-logic must not import presentation. Return state; let the UI render it.",
            },
          ],
        },
      ],
    },
  },
  {
    // Routes are shells. Business logic and reusable UI live in src/features + src/common.
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message:
                "Routes never call the network. Consume a business-logic hook.",
            },
            {
              name: "@tanstack/react-query",
              message:
                "Routes never use React Query directly. Consume a business-logic hook.",
            },
          ],
        },
      ],
    },
  },
]);
