import { ConfigContext, ExpoConfig } from "expo/config";

// ─── Per-project constants: change these first when starting a new app. ───
const APP_NAME = "App Template";
const APP_SLUG = "app-template";
const APP_SCHEME = "apptemplate";
const IOS_BUNDLE_ID = "com.pj21.apptemplate";
const ANDROID_PACKAGE = "com.pj21.apptemplate";

// Bump on release. `buildNumber` must increase for every store upload, even
// when the marketing version does not change.
const APP_VERSION = "1.0.0";
const BUILD_NUMBER = 1;
// ─────────────────────────────────────────────────────────────────────────

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: APP_NAME,
    slug: APP_SLUG,
    scheme: APP_SCHEME,
    version: APP_VERSION,
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    ios: {
      bundleIdentifier: IOS_BUNDLE_ID,
      buildNumber: BUILD_NUMBER.toString(),
      supportsTablet: true,
    },
    android: {
      package: ANDROID_PACKAGE,
      versionCode: BUILD_NUMBER,
      adaptiveIcon: {
        backgroundColor: "#FFFFFF",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-localization",
      "expo-secure-store",
      "expo-notifications",
      // Local plugin — see plugins/withAndroidSigning.js
      "./plugins/withAndroidSigning",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#FFFFFF",
          image: "./assets/images/splash-icon.png",
          imageWidth: 160,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  };
};
