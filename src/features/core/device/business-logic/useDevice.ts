import { useCallback, useEffect } from "react";
import { Storage } from "@/common/data-access/storage/storage";
import { StorageKeys } from "@/common/data-access/storage/storageKeys";
import { generateDeviceUuid } from "@/features/core/device/data-access/deviceInfo";
import {
  useDeviceStoreHasHydrated,
  useDeviceStoreSetHydrated,
  useDeviceStoreUpdate,
  useDeviceStoreUuid,
} from "@/features/core/device/business-logic/store/deviceSelectors";
import { deviceRef } from "@/features/core/device/business-logic/deviceRef";

/**
 * The per-install identity every request carries. Guest carts, anonymous
 * sessions and push targeting all hang off it, so it is created once and never
 * regenerated for the life of the install.
 */
export const useDevice = () => {
  const uuid = useDeviceStoreUuid();
  const hasHydrated = useDeviceStoreHasHydrated();
  const updateUuid = useDeviceStoreUpdate();
  const setHasHydrated = useDeviceStoreSetHydrated();

  useEffect(() => {
    deviceRef.uuid = uuid ?? null;
  }, [uuid]);

  const hydrate = useCallback(async () => {
    const stored = await Storage.get(StorageKeys.DEVICE_UUID);
    const resolved = stored ?? generateDeviceUuid();
    if (!stored) await Storage.set(StorageKeys.DEVICE_UUID, resolved);
    deviceRef.uuid = resolved;
    updateUuid(resolved);
    setHasHydrated(true);
  }, [updateUuid, setHasHydrated]);

  return { uuid, hasHydrated, hydrate };
};
