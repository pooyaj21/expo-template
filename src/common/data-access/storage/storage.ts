import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

/**
 * The one door to device persistence. App code never imports AsyncStorage or
 * SecureStore directly — swapping the backend (MMKV, encrypted store) then
 * touches this file only, and every key in the app is greppable from here.
 */
export const Storage = {
  get: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // A failed write is not worth crashing a screen over.
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // no-op
    }
  },

  getJson: async <T>(key: string): Promise<T | null> => {
    const raw = await Storage.get(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setJson: async <T>(key: string, value: T): Promise<void> => {
    await Storage.set(key, JSON.stringify(value));
  },
};

/**
 * Anything a leaked backup would compromise — tokens, refresh tokens, PINs.
 * Keychain / Keystore backed, so it is slower and unavailable on web.
 */
export const SecureStorage = {
  get: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  set: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // no-op
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // no-op
    }
  },
};
