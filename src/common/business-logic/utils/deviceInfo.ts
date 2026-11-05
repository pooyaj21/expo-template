import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";

const safeString = (read: () => unknown): string => {
  try {
    const value = read();
    return typeof value === "string"
      ? value
      : value == null
        ? ""
        : String(value);
  } catch {
    return "";
  }
};

export type DeviceOs = "ios" | "android";

export const deviceOs = (): DeviceOs =>
  Platform.OS === "ios" ? "ios" : "android";

export const deviceOsVersion = (): string => safeString(() => Platform.Version);

export const appVersion = (): string =>
  safeString(() => Constants.expoConfig?.version);

export const appBuildNumber = (): number => {
  const parsed = Number(
    safeString(() =>
      Platform.OS === "ios"
        ? Constants.expoConfig?.ios?.buildNumber
        : Constants.expoConfig?.android?.versionCode,
    ),
  );
  return Number.isFinite(parsed) ? parsed : 0;
};

const iosModelId = (): string | undefined => {
  const modelId: unknown = Device.modelId;
  return typeof modelId === "string" ? modelId : undefined;
};

export const deviceName = (): string =>
  Platform.OS === "ios"
    ? safeString(() => Device.deviceName)
    : [Device.manufacturer, Device.modelName].filter(Boolean).join(" ");

export const deviceTitle = (): string =>
  Platform.OS === "ios"
    ? safeString(iosModelId)
    : safeString(() => Device.modelName);
