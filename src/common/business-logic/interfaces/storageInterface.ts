import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { StateStorage } from "zustand/middleware";
import { reportError } from "@/common/business-logic/observability/errorReporter";

export interface StorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const ANDROID_VALUE_SIZE_LIMIT = 2048;

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

/** Plain AsyncStorage — default for non-sensitive Zustand persist / flags. */
export const appStorage: StorageInterface & StateStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};

/**
 * Keystore-backed (Android) / Keychain-backed (iOS) storage for credentials.
 * Compatible with Zustand `createJSONStorage(() => secureStorage)`.
 */
export const secureStorage: StorageInterface & StateStorage = {
  getItem: async (key) => {
    try {
      return await SecureStore.getItemAsync(key, secureStoreOptions);
    } catch (error) {
      reportError(error, {
        feature: "secureStorage",
        operation: "getItem",
        key,
      });
      return null;
    }
  },

  setItem: async (key, value) => {
    if (
      value.length > ANDROID_VALUE_SIZE_LIMIT &&
      process.env.EXPO_PUBLIC_FLAVOR !== "production"
    ) {
      console.log(
        `secureStorage: ${key} is ${value.length} bytes, above the ${ANDROID_VALUE_SIZE_LIMIT} byte Android limit`,
      );
    }

    try {
      await SecureStore.setItemAsync(key, value, secureStoreOptions);
    } catch (error) {
      reportError(error, {
        feature: "secureStorage",
        operation: "setItem",
        key,
      });
    }
  },

  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key, secureStoreOptions);
    } catch (error) {
      reportError(error, {
        feature: "secureStorage",
        operation: "removeItem",
        key,
      });
    }
  },
};
