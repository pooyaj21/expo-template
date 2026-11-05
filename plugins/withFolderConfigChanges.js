const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withFolderConfigChanges(config) {
  return withAndroidManifest(config, async (config) => {
    const activity = config.modResults.manifest.application[0].activity[0];

    let current = activity.$["android:configChanges"] || "";

    if (!current.includes("smallestScreenSize")) {
      activity.$["android:configChanges"] = current + "|smallestScreenSize";
    }

    return config;
  });
};
