import { create, StateCreator } from "zustand";

interface DeviceState {
  uuid?: string;
  /** False until the persisted uuid has been read; gates registration. */
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  updateUuid: (uuid: string) => void;
  clearUuid: () => void;
}

const createDeviceSlice: StateCreator<DeviceState> = (set) => ({
  uuid: undefined,
  hasHydrated: false,
  setHasHydrated: (hasHydrated) => set({ hasHydrated }),
  updateUuid: (uuid) => set({ uuid }),
  clearUuid: () => set({ uuid: undefined }),
});

export const useDeviceStore = create<DeviceState>()((...a) => ({
  ...createDeviceSlice(...a),
}));
