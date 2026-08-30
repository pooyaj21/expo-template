import { useDeviceStore } from "@/features/core/device/business-logic/store/deviceSlice";

export const useDeviceStoreUuid = () => useDeviceStore((s) => s.uuid);
export const useDeviceStoreHasHydrated = () =>
  useDeviceStore((s) => s.hasHydrated);
export const useDeviceStoreUpdate = () => useDeviceStore((s) => s.updateUuid);
export const useDeviceStoreSetHydrated = () =>
  useDeviceStore((s) => s.setHasHydrated);
