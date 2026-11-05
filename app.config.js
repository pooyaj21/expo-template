// Prebuild-time config. These are read in Node while the native projects are
// generated, so they are plain env vars (no EXPO_PUBLIC_ prefix) and never reach
// the JS bundle. Runtime config lives in features/core/environment.
require("dotenv").config();

// =============================================================================
// IDENTITY — single edit point for `npm run rename`.
// Per-flavor suffixes (.develop / .stage, display name, scheme) are derived below.
// =============================================================================
const IDENTITY = {
  name: "App Template",
  slug: "app-template",
  /** Base iOS bundle id AND Android applicationId (no flavor suffix). */
  bundleId: "com.pj21.apptemplate",
  /** Custom URL scheme base (no flavor suffix). */
  scheme: "apptemplate",
};

// Hard-fail helper for CI/prebuild values that must never be empty.
const requireEnv = (name) => {
  // Dynamic lookup is intentional for Node prebuild — not a JS-bundle read.
  // eslint-disable-next-line expo/no-dynamic-env-var
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `app.config.js: ${name} is not set. Add it to .env (see .env.example).`,
    );
  }
  return value;
};

const normalizeFlavor = (raw) => {
  if (raw === "development" || raw === "dev") return "develop";
  if (raw === "prod") return "production";
  return raw || "develop";
};

/** @param {ReturnType<typeof normalizeFlavor>} flavor */
const flavorIdentity = (flavor) => {
  const suffix =
    flavor === "develop" ? ".develop" : flavor === "stage" ? ".stage" : "";
  const nameSuffix =
    flavor === "develop" ? " Dev" : flavor === "stage" ? " Stage" : "";
  const schemeSuffix =
    flavor === "develop" ? "-develop" : flavor === "stage" ? "-stage" : "";

  return {
    displayName: `${IDENTITY.name}${nameSuffix}`,
    bundleIdentifier: `${IDENTITY.bundleId}${suffix}`,
    androidPackage: `${IDENTITY.bundleId}${suffix}`,
    scheme: `${IDENTITY.scheme}${schemeSuffix}`,
    iconDir: `./assets/images/${flavor}`,
  };
};

/** Comma-separated https hosts claimed for universal / app links. Empty = off. */
const parseAppLinkHosts = () =>
  (process.env.APP_LINK_HOSTS || "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

export { requireEnv, IDENTITY };

export default ({ config }) => {
  const flavor = normalizeFlavor(process.env.EXPO_PUBLIC_FLAVOR);
  const isDevelop = flavor !== "production";
  const id = flavorIdentity(flavor);

  // Optional local-signing identity. requireEnv keeps the helper available for
  // CI/prebuild scripts that want a hard fail; local prebuild skips when unset.
  const appleTeamId = process.env.APPLE_TEAM_ID;

  let version = "1.0.0";
  let versionCode = 1;
  let buildNumber = String(versionCode);

  const tag = process.env.CI_COMMIT_TAG;
  if (tag) {
    const match = tag.match(/^(\d+\.\d+\.\d+)\(#(\d+)\)$/);
    if (match) {
      version = match[1];
      versionCode = parseInt(match[2], 10);
      buildNumber = String(versionCode);
    }
  }

  const appLinkHosts = parseAppLinkHosts();
  // Precise claims only — keep in sync with docs/deeplinks/* and +native-intent.
  const appLinkPathData = [{ path: "/" }, { pathPrefix: "/example/" }];

  return {
    expo: {
      name: id.displayName,
      slug: IDENTITY.slug,
      version,
      orientation: "portrait",
      icon: `${id.iconDir}/icon.png`,
      scheme: id.scheme,
      userInterfaceStyle: "automatic",
      ios: {
        bundleIdentifier: id.bundleIdentifier,
        ...(appleTeamId ? { appleTeamId } : {}),
        supportsTablet: true,
        buildNumber,
        icon: `${id.iconDir}/icon.png`,
        infoPlist: {
          // Hide expo-dev-menu's floating button; open the dev menu by shake or Cmd+D.
          EXDevMenuShowFloatingActionButton: false,
          CFBundleURLTypes: [
            {
              CFBundleURLSchemes: [id.scheme],
            },
          ],
        },
        ...(appLinkHosts.length > 0
          ? {
              associatedDomains: appLinkHosts.map((host) => `applinks:${host}`),
            }
          : {}),
      },
      android: {
        package: id.androidPackage,
        versionCode,
        adaptiveIcon: {
          backgroundColor: "#ffffff",
          foregroundImage: `${id.iconDir}/android-icon-foreground.png`,
          monochromeImage: `${id.iconDir}/android-icon-monochrome.png`,
        },
        predictiveBackGestureEnabled: false,
        allowBackup: false,
        backgroundColor: "#ffffff",
        ...(isDevelop
          ? {}
          : {
              blockedPermissions: ["android.permission.ACTIVITY_RECOGNITION"],
            }),
        ...(appLinkHosts.length > 0
          ? {
              intentFilters: [
                {
                  action: "VIEW",
                  autoVerify: true,
                  data: appLinkHosts.flatMap((host) =>
                    appLinkPathData.map((pathSpec) => ({
                      scheme: "https",
                      host,
                      ...pathSpec,
                    })),
                  ),
                  category: ["BROWSABLE", "DEFAULT"],
                },
              ],
            }
          : {}),
      },
      plugins: [
        ...(isDevelop ? [] : [["expo-sensors", { motionPermission: false }]]),
        [
          "expo-router",
          {
            root: "src/app",
          },
        ],
        "expo-font",
        [
          "expo-splash-screen",
          {
            image: `${id.iconDir}/splash-icon.png`,
            imageWidth: 200,
            resizeMode: "contain",
            backgroundColor: "#ffffff",
          },
        ],
        [
          "expo-build-properties",
          {
            android: {
              compileSdkVersion: 36,
              targetSdkVersion: 36,
              minSdkVersion: 24,
              enableProguardInReleaseBuilds: true,
              enableShrinkResourcesInReleaseBuilds: true,
            },
            ios: {
              deploymentTarget: "15.1",
            },
          },
        ],
        "./plugins/withAndroidResConfigs",
        "./plugins/withFolderConfigChanges",
        "./plugins/withFastlane",
        ...(process.env.CI ? [] : ["./plugins/withAndroidSigning"]),
      ],
      extra: {
        flavor,
        identity: {
          baseName: IDENTITY.name,
          slug: IDENTITY.slug,
          baseBundleId: IDENTITY.bundleId,
          baseScheme: IDENTITY.scheme,
        },
      },
      experiments: {
        typedRoutes: true,
        reactCompiler: true,
      },
    },
  };
};
