// Prebuild-time config. These are read in Node while the native projects are
// generated, so they are plain env vars (no EXPO_PUBLIC_ prefix) and never reach
// the JS bundle. Runtime config lives in features/core/environment.
require("dotenv").config();

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

export { requireEnv };

export default ({ config }) => {
  const flavor = normalizeFlavor(process.env.EXPO_PUBLIC_FLAVOR);
  const isDevelop = flavor !== "production";

  // Identity is fixed for this template — do not read from env (avoids drift).
  const bundleIdentifier = "com.pj21.apptemplate";
  const androidPackage = "com.pj21.apptemplate";
  const appScheme = "apptemplate";

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

  return {
    expo: {
      name: "App Template",
      slug: "app-template",
      version,
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: appScheme,
      userInterfaceStyle: "automatic",
      ios: {
        bundleIdentifier,
        ...(appleTeamId ? { appleTeamId } : {}),
        supportsTablet: true,
        buildNumber,
        icon: "./assets/images/icon.png",
        infoPlist: {
          CFBundleURLTypes: [
            {
              CFBundleURLSchemes: [appScheme],
            },
          ],
        },
      },
      android: {
        package: androidPackage,
        versionCode,
        adaptiveIcon: {
          backgroundColor: "#ffffff",
          foregroundImage: "./assets/images/android-icon-foreground.png",
          monochromeImage: "./assets/images/android-icon-monochrome.png",
        },
        predictiveBackGestureEnabled: false,
        allowBackup: false,
        backgroundColor: "#ffffff",
        ...(isDevelop
          ? {}
          : {
              blockedPermissions: ["android.permission.ACTIVITY_RECOGNITION"],
            }),
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
            image: "./assets/images/splash-icon.png",
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
        ...(process.env.CI ? [] : ["./plugins/withAndroidSigning"]),
      ],
      extra: {
        flavor,
      },
      experiments: {
        typedRoutes: true,
        reactCompiler: true,
      },
    },
  };
};
