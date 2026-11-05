import { StateCreator } from "zustand";
import {
  FlagName,
  ServerFlagName,
  flagCatalog,
  envFlagValues,
  EnvFlagName,
} from "@/features/core/feature-flags/business-logic/flagCatalog";
import { isDevelop } from "@/features/core/environment/business-logic/appConfig";

export type FeatureFlagSlice = {
  featureFlagServerValues: Partial<Record<ServerFlagName, boolean>>;
  featureFlagDevOverrides: Partial<Record<FlagName, boolean>>;
  updateServerFeatureFlags: (
    flags: Partial<Record<ServerFlagName, boolean>>,
  ) => void;
  setFeatureFlagDevOverride: (flag: FlagName, value?: boolean) => void;
  clearFeatureFlagDevOverrides: () => void;
};

export const createFeatureFlagSlice: StateCreator<
  FeatureFlagSlice,
  [],
  [],
  FeatureFlagSlice
> = (set) => ({
  featureFlagServerValues: {},
  featureFlagDevOverrides: {},
  updateServerFeatureFlags: (flags) =>
    set({ featureFlagServerValues: { ...flags } }),
  setFeatureFlagDevOverride: (flag, value) =>
    set((state) => {
      const featureFlagDevOverrides = {
        ...state.featureFlagDevOverrides,
      };
      if (value === undefined) {
        delete featureFlagDevOverrides[flag];
      } else {
        featureFlagDevOverrides[flag] = value;
      }
      return { featureFlagDevOverrides };
    }),
  clearFeatureFlagDevOverrides: () => set({ featureFlagDevOverrides: {} }),
});

export type FeatureFlagLayers = Pick<
  FeatureFlagSlice,
  "featureFlagServerValues" | "featureFlagDevOverrides"
>;

export type ResolvedFeatureFlag = {
  flag: FlagName;
  isEnabled: boolean;
  source: "devOverride" | "env" | "server" | "default";
};

/**
 * Resolve a flag using only its declared source (plus optional develop-only
 * override). Env flags never consult the server map and vice versa.
 */
export const resolveFeatureFlag = (
  flag: FlagName,
  layers: FeatureFlagLayers,
): ResolvedFeatureFlag => {
  const definition = flagCatalog[flag];
  const devOverride = isDevelop
    ? layers.featureFlagDevOverrides[flag]
    : undefined;

  if (devOverride !== undefined) {
    return { flag, isEnabled: devOverride, source: "devOverride" };
  }

  if (definition.source === "env") {
    const envValue = envFlagValues[flag as EnvFlagName];
    if (envValue !== undefined) {
      return { flag, isEnabled: envValue, source: "env" };
    }
    return { flag, isEnabled: definition.default, source: "default" };
  }

  const serverValue = layers.featureFlagServerValues[flag as ServerFlagName];
  if (serverValue !== undefined) {
    return { flag, isEnabled: serverValue, source: "server" };
  }

  return { flag, isEnabled: definition.default, source: "default" };
};
