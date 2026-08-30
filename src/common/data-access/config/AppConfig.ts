/**
 * Build-time configuration, read once. Only `EXPO_PUBLIC_*` is inlined into the
 * bundle by Metro — a value that must stay secret does not belong here.
 */
import Constants from "expo-constants";

export type AppEnvironment = "development" | "stage" | "production";

const environment =
  (process.env.EXPO_PUBLIC_ENVIRONMENT as AppEnvironment) || "production";

export const AppConfig = {
  environment,
  /** True for dev AND stage: gates debug UI, verbose logging, and dev-only routes. */
  isDevelop: environment !== "production",
  /** Expo Go cannot load custom native modules — push and most SDKs no-op there. */
  isExpoGo: Constants.appOwnership === "expo",
  devUrl: process.env.EXPO_PUBLIC_API_DEV_URL || "",
  stageUrl: process.env.EXPO_PUBLIC_API_STAGE_URL || "",
  prodUrl: process.env.EXPO_PUBLIC_API_PROD_URL || "",

  // Per-project external URLs go here rather than at their call sites, so a
  // rebrand or locale change is one edit.
  termsUrl: (language: "en" | "ar") => `https://example.com/${language}/terms`,
  privacyUrl: (language: "en" | "ar") =>
    `https://example.com/${language}/privacy`,
};
