const { withDangerousMod, withAppBuildGradle } = require("expo/config-plugins");

const fs = require("fs");
const path = require("path");

/**
 * Injects the release keystore into the Android project at prebuild time.
 *
 * 1. Copies `key.jks` (repo root, gitignored) → `android/app/key.jks`.
 * 2. Rewrites the `debug` block in `signingConfigs` to use it, so CI-built
 *    "debug" distribution APKs are signed with the real key.
 *
 * Secrets come from the environment (Expo loads `.env` during prebuild), so
 * nothing sensitive lives in this committed file. Required vars:
 *   KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD
 *
 * If `key.jks` or any var is missing the step is skipped and the default debug
 * keystore is left alone — prebuild still works for teammates without the
 * signing material.
 */

const KEYSTORE_FILE_NAME = "key.jks";

// Matches the Expo template's debug signing block (no nested braces inside it).
const DEBUG_SIGNING_REGEX =
  /debug\s*\{[^{}]*storeFile\s+file\(['"]debug\.keystore['"]\)[^{}]*\}/;

const withAndroidSigning = (config) => {
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const source = path.join(
        config.modRequest.projectRoot,
        KEYSTORE_FILE_NAME,
      );
      const destination = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        KEYSTORE_FILE_NAME,
      );

      if (!fs.existsSync(source)) {
        console.log(
          `ℹ️  ${KEYSTORE_FILE_NAME} not found — skipping keystore injection`,
        );
        return config;
      }

      fs.copyFileSync(source, destination);
      console.log(`🔐 ${KEYSTORE_FILE_NAME} injected → android/app`);
      return config;
    },
  ]);

  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") return config;

    const storePassword = process.env.KEYSTORE_PASSWORD;
    const keyAlias = process.env.KEY_ALIAS;
    const keyPassword = process.env.KEY_PASSWORD;

    if (!storePassword || !keyAlias || !keyPassword) {
      console.log(
        "ℹ️  KEYSTORE_PASSWORD / KEY_ALIAS / KEY_PASSWORD not set — leaving default debug signing",
      );
      return config;
    }

    const buildGradle = config.modResults.contents;

    // Idempotent: `prebuild --clean` resets to the template, so always re-apply
    // against the template block; if it already points at key.jks, do nothing.
    if (!DEBUG_SIGNING_REGEX.test(buildGradle)) {
      if (!buildGradle.includes(`file('${KEYSTORE_FILE_NAME}')`)) {
        console.log(
          "⚠️  Could not locate the debug signingConfig block — untouched",
        );
      }
      return config;
    }

    config.modResults.contents = buildGradle.replace(
      DEBUG_SIGNING_REGEX,
      `debug {
            storeFile file('${KEYSTORE_FILE_NAME}')
            storePassword '${storePassword}'
            keyAlias '${keyAlias}'
            keyPassword '${keyPassword}'
        }`,
    );
    console.log("🔐 debug signingConfig → key.jks");
    return config;
  });

  return config;
};

module.exports = withAndroidSigning;
