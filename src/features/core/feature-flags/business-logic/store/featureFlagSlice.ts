import AsyncStorage from "@react-native-async-storage/async-storage";
import { create, StateCreator } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AppConfig } from "@/common/data-access/config/AppConfig";
import { envFeatureFlags } from "@/features/core/feature-flags/data-access/envFeatureFlags";
import {
  FEATURE_FLAG_DEFAULTS,
  FeatureFlagEnums,
  FeatureFlagInterface,
  FeatureFlagSourceEnums,
  FeatureFlagValues,
} from "@/features/core/feature-flags/data-access/featureFlagTypes";

interface FeatureFlagState {
  serverFlags: FeatureFlagValues;
  devOverrides: FeatureFlagValues;
  updateServerFlags: (serverFlags: FeatureFlagValues) => void;
  setDevOverride: (flag: FeatureFlagEnums, value?: boolean) => void;
  clearDevOverrides: () => void;
}

const createFeatureFlagSlice: StateCreator<FeatureFlagState> = (set) => ({
  serverFlags: {},
  devOverrides: {},
  updateServerFlags: (serverFlags) => set({ serverFlags }),
  setDevOverride: (flag, value) =>
    set((state) => ({
      devOverrides: { ...state.devOverrides, [flag]: value },
    })),
  clearDevOverrides: () => set({ devOverrides: {} }),
});

export const useFeatureFlagStore = create<FeatureFlagState>()(
  persist(
    (...a) => ({
      ...createFeatureFlagSlice(...a),
    }),
    {
      // Matches StorageKeys.FEATURE_FLAGS — only overrides are persisted.
      name: "FEATURE_FLAG_STORAGE",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Server flags come back on every /app/settings call, so only the
      // debug-screen overrides are worth keeping across restarts.
      partialize: (state) => ({ devOverrides: state.devOverrides }),
    },
  ),
);

export type FeatureFlagLayers = Pick<
  FeatureFlagState,
  "serverFlags" | "devOverrides"
>;

export const resolveFeatureFlag = (
  flag: FeatureFlagEnums,
  layers: FeatureFlagLayers,
): FeatureFlagInterface => {
  const devOverride = AppConfig.isDevelop
    ? layers.devOverrides[flag]
    : undefined;
  const serverValue = layers.serverFlags[flag];
  const envValue = envFeatureFlags[flag];

  const winner = (): Pick<FeatureFlagInterface, "isEnabled" | "source"> => {
    if (devOverride !== undefined) {
      return {
        isEnabled: devOverride,
        source: FeatureFlagSourceEnums.DEV_OVERRIDE,
      };
    }
    if (serverValue !== undefined) {
      return { isEnabled: serverValue, source: FeatureFlagSourceEnums.SERVER };
    }
    if (envValue !== undefined) {
      return { isEnabled: envValue, source: FeatureFlagSourceEnums.ENV };
    }
    return {
      isEnabled: FEATURE_FLAG_DEFAULTS[flag],
      source: FeatureFlagSourceEnums.DEFAULT,
    };
  };

  return { flag, devOverride, serverValue, envValue, ...winner() };
};

export const getFeatureFlag = (flag: FeatureFlagEnums): FeatureFlagInterface =>
  resolveFeatureFlag(flag, useFeatureFlagStore.getState());

export const isFeatureEnabled = (flag: FeatureFlagEnums): boolean =>
  getFeatureFlag(flag).isEnabled;
