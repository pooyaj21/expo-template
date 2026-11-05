import { apiClient } from "@/common/data-access/api/axios";
import { prettyLog } from "@/common/data-access/log/prettyLog";
import { BaseResponseType } from "@/common/data-access/type/responseTypes";
import {
  DEFAULT_APP_SETTINGS,
  normalizeAppSettings,
} from "@/features/core/app-settings/data-access/appSettingsDefaults";
import type { AppSettingsData } from "@/features/core/app-settings/data-access/appSettingsTypes";

/**
 * GET {apiBaseUrl}/app/settings — soft-fails to defaults (logged via prettyLog,
 * never thrown to the boot path).
 */
export const fetchAppSettings = async (): Promise<AppSettingsData> => {
  try {
    const response =
      await apiClient.get<BaseResponseType<AppSettingsData>>("/app/settings");
    return normalizeAppSettings(response.data?.data);
  } catch (error) {
    prettyLog("⚠️ App settings unavailable — using defaults", {
      message: error instanceof Error ? error.message : String(error),
    });
    return DEFAULT_APP_SETTINGS;
  }
};
