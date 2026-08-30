import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Storage } from "@/common/data-access/storage/storage";
import { StorageKeys } from "@/common/data-access/storage/storageKeys";

/**
 * Push plumbing, kept away from React. Swapping Expo push for OneSignal or FCM
 * means rewriting this file and nothing else.
 */
export const notificationsService = {
  /**
   * Asks only if not already decided — a second prompt is a no-op on iOS and
   * an annoyance on Android 13+.
   */
  requestPermission: async (): Promise<boolean> => {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const next = await Notifications.requestPermissionsAsync();
    return next.granted;
  },

  getPushToken: async (): Promise<string | null> => {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    if (!projectId) return null;

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  },

  /** Android needs a channel or notifications arrive silently. */
  configureAndroidChannel: async () => {
    if (Platform.OS !== "android") return;
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  },

  readStoredToken: () => Storage.get(StorageKeys.PUSH_TOKEN),
  writeStoredToken: (token: string) =>
    Storage.set(StorageKeys.PUSH_TOKEN, token),
};
