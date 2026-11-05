const { withAppBuildGradle } = require("expo/config-plugins");

module.exports = function withAndroidResConfigs(config) {
  return withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes("resourceConfigurations")) {
      config.modResults.contents = config.modResults.contents.replace(
        /defaultConfig\s*{/,
        'defaultConfig {\n        resourceConfigurations += ["en", "ar"]',
      );
    }
    return config;
  });
};
