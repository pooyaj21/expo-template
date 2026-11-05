// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const boundaries = require("eslint-plugin-boundaries");

const element = (type) => ({ element: { type } });
const allowTo = (...types) => types.map((type) => ({ to: element(type) }));

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: [
      "dist/*",
      ".expo/*",
      "expo-env.d.ts",
      "node_modules/*",
      "android/*",
      "ios/*",
      "build-logs/*",
      "app.config.js",
      "babel.config.js",
      "metro.config.js",
      "plugins/**",
      "scripts/**",
    ],
  },
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "common-presentation", pattern: "src/common/presentation/**" },
        {
          type: "common-business-logic",
          pattern: "src/common/business-logic/**",
        },
        {
          type: "common-data-access",
          pattern: "src/common/data-access/**",
        },
        {
          type: "feature-presentation",
          pattern: [
            "src/features/*/presentation/**",
            "src/features/core/*/presentation/**",
          ],
        },
        {
          type: "feature-business-logic",
          pattern: [
            "src/features/*/business-logic/**",
            "src/features/core/*/business-logic/**",
          ],
        },
        {
          type: "feature-data-access",
          pattern: [
            "src/features/*/data-access/**",
            "src/features/core/*/data-access/**",
          ],
        },
        {
          type: "feature-root",
          pattern: "src/features/*.*",
        },
      ],
      "boundaries/files": [
        {
          pattern: "src/common/business-logic/store/app-state.ts",
          category: "app-state",
        },
        {
          pattern: [
            "src/features/*/data-access/*Types.ts",
            "src/features/core/*/data-access/*Types.ts",
          ],
          category: "data-access-types",
        },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            // app → features/common
            {
              from: element("app"),
              allow: allowTo(
                "feature-presentation",
                "feature-business-logic",
                "feature-data-access",
                "feature-root",
                "common-presentation",
                "common-business-logic",
                "common-data-access",
              ),
            },

            // feature presentation → own business-logic, own *Types.ts, common
            {
              from: element("feature-presentation"),
              allow: [
                ...allowTo(
                  "feature-presentation",
                  "feature-business-logic",
                  "common-presentation",
                  "common-business-logic",
                ),
                { to: { file: { categories: "data-access-types" } } },
                { to: { file: { categories: "app-state" } } },
              ],
            },

            // business-logic → data-access, common (never presentation)
            {
              from: element("feature-business-logic"),
              allow: [
                ...allowTo(
                  "feature-business-logic",
                  "feature-data-access",
                  "common-business-logic",
                  "common-data-access",
                ),
                { to: { file: { categories: "data-access-types" } } },
                { to: { file: { categories: "app-state" } } },
              ],
            },

            // data-access → common data-access + query-key helpers
            {
              from: element("feature-data-access"),
              allow: [
                ...allowTo(
                  "feature-data-access",
                  "common-data-access",
                  "common-business-logic",
                ),
                { to: { file: { categories: "data-access-types" } } },
              ],
            },

            // feature root files (e.g. CoreBootstrap.ts)
            {
              from: element("feature-root"),
              allow: [
                ...allowTo(
                  "feature-presentation",
                  "feature-business-logic",
                  "feature-data-access",
                  "common-presentation",
                  "common-business-logic",
                  "common-data-access",
                ),
                { to: { file: { categories: "data-access-types" } } },
                { to: { file: { categories: "app-state" } } },
              ],
            },

            // common layers — never import features except app-state.
            {
              from: element("common-presentation"),
              allow: [
                ...allowTo("common-presentation", "common-business-logic"),
                {
                  to: { element: { type: "common-data-access" } },
                  dependency: { kind: "type" },
                },
                { to: { file: { categories: "app-state" } } },
              ],
            },
            {
              from: element("common-business-logic"),
              allow: [
                ...allowTo("common-business-logic", "common-data-access"),
                {
                  to: { element: { type: "common-presentation" } },
                  dependency: { kind: "type" },
                },
                { to: { file: { categories: "app-state" } } },
              ],
            },
            {
              from: element("common-data-access"),
              allow: allowTo("common-data-access"),
            },

            // ONLY allowed common → features import site
            {
              from: { file: { categories: "app-state" } },
              allow: [
                ...allowTo(
                  "common-business-logic",
                  "common-data-access",
                  "feature-business-logic",
                ),
                { to: { file: { categories: "app-state" } } },
                { to: { file: { categories: "data-access-types" } } },
              ],
            },
          ],
        },
      ],
    },
  },
]);
