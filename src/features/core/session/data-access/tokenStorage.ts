import { SecureStorage } from "@/common/data-access/storage/storage";
import { StorageKeys } from "@/common/data-access/storage/storageKeys";

/**
 * The access token lives in the Keychain / Keystore, not AsyncStorage — a
 * device backup or a rooted read should not hand someone a live session.
 */
export const tokenStorage = {
  read: () => SecureStorage.get(StorageKeys.ACCESS_TOKEN),
  write: (token: string) => SecureStorage.set(StorageKeys.ACCESS_TOKEN, token),
  clear: () => SecureStorage.remove(StorageKeys.ACCESS_TOKEN),
};
