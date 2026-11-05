// React Compiler is NOT configured here — babel-preset-expo reads it off the
// Metro caller, which Expo CLI fills from `experiments.reactCompiler` in
// app.config.js. Setting it as a preset option would be silently ignored.
//
// Console stripping mirrors develop/stage keep-logging, production does not.
// Gating on NODE_ENV alone would silence stage too, which is also a release
// build. `error`/`warn` survive everywhere.
const DEBUG_ENVIRONMENTS = ["develop", "development", "stage"];

module.exports = function (api) {
  api.cache.using(() => process.env.EXPO_PUBLIC_FLAVOR);

  const stripConsole =
    api.env("production") &&
    !DEBUG_ENVIRONMENTS.includes(process.env.EXPO_PUBLIC_FLAVOR ?? "");

  return {
    presets: ["babel-preset-expo"],
    plugins: stripConsole
      ? [["transform-remove-console", { exclude: ["error", "warn"] }]]
      : [],
  };
};
