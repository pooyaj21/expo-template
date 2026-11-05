const { withDangerousMod, withAppBuildGradle } = require("expo/config-plugins");

const fs = require("fs");
const path = require("path");

/**
 * Injects the production keystore into the Android project at prebuild time.
 *
 * 1. Copies `key.jks` (repo root, gitignored) → `android/app/key.jks`.
 * 2. Rewrites the `debug` block in `signingConfigs` of `android/app/build.gradle`
 *    to point at `key.jks` with the credentials from `.env`.
 *
 * Secrets are read from the environment (Expo auto-loads `.env` during prebuild)
 * so nothing sensitive lives in this committed file. Required vars:
 *   ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD
 *
 * If `key.jks` or any required var is missing, the step is skipped and the
 * default debug keystore is left untouched — so prebuild still works for
 * teammates without the production signing material.
 */

const KEYSTORE_FILE_NAME = "key.jks";

// Matches the template's debug signing block (no nested braces inside it).
const DEBUG_SIGNING_REGEX =
  /debug\s*\{[^{}]*storeFile\s+file\(['"]debug\.keystore['"]\)[^{}]*\}/;

const withAndroidSigning = (config) => {
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const root = config.modRequest.projectRoot;
      const src = path.join(root, KEYSTORE_FILE_NAME);
      const dest = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        KEYSTORE_FILE_NAME,
      );

      if (!fs.existsSync(src)) {
        console.log(
          `ℹ️ ${KEYSTORE_FILE_NAME} not found at project root — skipping keystore injection`,
        );
        return config;
      }

      fs.copyFileSync(src, dest);
      console.log(`🔐 ${KEYSTORE_FILE_NAME} injected → android/app`);
      return config;
    },
  ]);

  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") return config;

    const storePassword = process.env.ANDROID_KEYSTORE_PASSWORD;
    const keyAlias = process.env.ANDROID_KEY_ALIAS;
    const keyPassword = process.env.ANDROID_KEY_PASSWORD;

    if (!storePassword || !keyAlias || !keyPassword) {
      console.log(
        "ℹ️ ANDROID_KEYSTORE_PASSWORD / ANDROID_KEY_ALIAS / ANDROID_KEY_PASSWORD not set — leaving default debug signing config",
      );
      return config;
    }

    let buildGradle = config.modResults.contents;

    // Idempotent: prebuild --clean resets to the template, so always re-apply
    // against the template block; if already pointing at key.jks, do nothing.
    if (!DEBUG_SIGNING_REGEX.test(buildGradle)) {
      if (!buildGradle.includes(`file('${KEYSTORE_FILE_NAME}')`)) {
        console.log(
          "⚠️ Could not locate the debug signingConfig block — leaving build.gradle untouched",
        );
      }
      return config;
    }

    const newBlock = `debug {
            storeFile file('${KEYSTORE_FILE_NAME}')
            storePassword '${storePassword}'
            keyAlias '${keyAlias}'
            keyPassword '${keyPassword}'
        }`;

    config.modResults.contents = buildGradle.replace(
      DEBUG_SIGNING_REGEX,
      newBlock,
    );
    console.log("🔐 debug signingConfig → key.jks");
    return config;
  });

  return config;
};

module.exports = withAndroidSigning;
