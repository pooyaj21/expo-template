const { getDefaultConfig } = require("expo/metro-config");
const { withDebugMenu } = require("@pj21/debug-menu/metro");

const config = getDefaultConfig(__dirname);

// `graphify update .` writes a multi-megabyte AST cache. Left unblocked, Metro
// crawls every JSON file in it on each cold start and keeps them in the watcher.
config.resolver.blockList = [
  ...[config.resolver.blockList ?? []].flat(),
  /(^|[/\\])graphify-out[/\\].*/,
];

// Stage is a release build but still wants the in-app debug menu and network
// log. The NODE_ENV clause keeps `expo start` working when no .env has been
// loaded, where the app would otherwise fall back to the production environment.
const isDebugBuild =
  process.env.NODE_ENV !== "production" ||
  ["develop", "development", "stage"].includes(
    process.env.EXPO_PUBLIC_FLAVOR ?? "",
  );

// Disabled, this resolves every `@pj21/debug-menu` import to its inert noop
// entry at resolution time — keeping network-logger out of store bundles.
module.exports = withDebugMenu(config, { enabled: isDebugBuild });
