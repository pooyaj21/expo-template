const {
  withDangerousMod,
  createRunOncePlugin,
} = require("expo/config-plugins");

const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return false;
  ensureDir(destDir);
  fs.cpSync(srcDir, destDir, { recursive: true, force: true });
  return true;
}

const withFastlane = (config) => {
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const root = config.modRequest.projectRoot;
      const androidSrc = path.join(root, "fastlane", "android");
      const androidDest = path.join(root, "android");

      const copied = copyDir(androidSrc, androidDest);
      if (copied) {
        console.log("Fastlane injected → android");
      } else {
        console.log("No Android Fastlane templates found (skipping)");
      }

      return config;
    },
  ]);

  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const root = config.modRequest.projectRoot;
      const iosSrc = path.join(root, "fastlane", "ios");
      const iosDest = path.join(root, "ios");

      const copied = copyDir(iosSrc, iosDest);
      if (copied) {
        console.log("Fastlane injected → ios");
      } else {
        console.log("No iOS Fastlane templates found (skipping)");
      }

      return config;
    },
  ]);

  return config;
};

module.exports = createRunOncePlugin(withFastlane, "with-fastlane", "1.0.0");
