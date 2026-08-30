import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { randomUUID } from "expo-crypto";

export interface DeviceInfo {
  uuid: string;
  os: string;
  os_version: string;
  model: string;
  app_version: string;
  build_number: string;
}

/**
 * A stable per-install id. Generated locally rather than read from the vendor
 * id, because iOS resets `identifierForVendor` when the last app from a vendor
 * is deleted — a guest cart or an anonymous session would vanish with it.
 */
export const generateDeviceUuid = () => randomUUID();

export const collectDeviceInfo = (uuid: string): DeviceInfo => ({
  uuid,
  os: Platform.OS,
  os_version: String(Device.osVersion ?? Platform.Version),
  model: Device.modelName ?? "unknown",
  app_version: Constants.expoConfig?.version ?? "1.0.0",
  build_number:
    (Platform.OS === "ios"
      ? Application.nativeBuildVersion
      : Constants.expoConfig?.android?.versionCode?.toString()) ?? "1",
});
