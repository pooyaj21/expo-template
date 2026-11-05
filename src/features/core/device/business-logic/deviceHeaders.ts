import DeviceInfo from "react-native-device-info";
import { registerRequestHeaderProvider } from "@/common/data-access/api/requestHeaders";
import { appStorage } from "@/common/business-logic/interfaces/storageInterface";

/**
 * Must match the key Lane A persists for the active language.
 * Read from storage (not LocalizationProvider) so data-access stays free of
 * presentation imports.
 */
export const LANGUAGE_STORAGE_KEY = "language";

const DEFAULT_LANGUAGE = "en";

let cachedDeviceId: string | null = null;

export const getDeviceId = async (): Promise<string> => {
  if (cachedDeviceId) return cachedDeviceId;
  cachedDeviceId = await DeviceInfo.getUniqueId();
  return cachedDeviceId;
};

export const resolveAcceptLanguage = async (): Promise<string> => {
  const stored = await appStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && stored.trim().length > 0) return stored.trim();
  return DEFAULT_LANGUAGE;
};

/**
 * Registers Device-Id + Accept-Language on the shared API client.
 * Call once from CoreBootstrap (side-effect import).
 */
export const registerDeviceHeaderProvider = (): (() => void) =>
  registerRequestHeaderProvider(async () => {
    const [deviceId, language] = await Promise.all([
      getDeviceId(),
      resolveAcceptLanguage(),
    ]);

    return {
      "Device-Id": deviceId,
      "Accept-Language": language,
    };
  });
