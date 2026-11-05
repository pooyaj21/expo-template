import type { AppSettingsData } from "@/features/core/app-settings/data-access/appSettingsTypes";

/** Soft-fail fallback when the network or envelope is unavailable. */
export const DEFAULT_APP_SETTINGS: AppSettingsData = {
  static_pages: {
    terms_and_conditions: "",
    privacy_policy: "",
    return_policy: "",
  },
};

export const isAppSettingsData = (value: unknown): value is AppSettingsData => {
  if (value == null || typeof value !== "object") return false;
  const pages = (value as { static_pages?: unknown }).static_pages;
  if (pages == null || typeof pages !== "object") return false;
  return true;
};

export const normalizeAppSettings = (value: unknown): AppSettingsData => {
  if (!isAppSettingsData(value)) return DEFAULT_APP_SETTINGS;
  const pages = value.static_pages as Partial<AppSettingsData["static_pages"]>;
  return {
    static_pages: {
      terms_and_conditions: pages.terms_and_conditions ?? "",
      privacy_policy: pages.privacy_policy ?? "",
      return_policy: pages.return_policy ?? "",
    },
    extras:
      value.extras && typeof value.extras === "object"
        ? (value.extras as Record<string, unknown>)
        : undefined,
  };
};
