/**
 * Every persisted key in the app, in one place. A key that lives at its call
 * site is a key nobody can audit, migrate, or clear on logout.
 */
export const StorageKeys = {
  LANGUAGE: "LANGUAGE_STORAGE",
  ENVIRONMENT: "ENVIRONMENT_STORAGE",
  LOCAL_API_URL: "LOCAL_API_URL_STORAGE",
  ACCESS_TOKEN: "ACCESS_TOKEN_STORAGE",
  DEVICE_UUID: "DEVICE_UUID_STORAGE",
  PUSH_TOKEN: "PUSH_TOKEN_STORAGE",
  ONBOARDING_SEEN: "ONBOARDING_SEEN_STORAGE",
  /** Persisted by the feature-flag store (devOverrides only). */
  FEATURE_FLAGS: "FEATURE_FLAG_STORAGE",
} as const;
