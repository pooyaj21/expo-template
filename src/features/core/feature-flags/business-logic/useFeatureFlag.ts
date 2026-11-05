import { useCallback, useMemo } from "react";
import { useAppStore } from "@/common/business-logic/store/app-state";
import {
  EnvFlagName,
  FlagName,
  FLAG_NAMES,
  ServerFlagName,
  flagCatalog,
} from "@/features/core/feature-flags/business-logic/flagCatalog";
import {
  resolveFeatureFlag,
  ResolvedFeatureFlag,
} from "@/features/core/feature-flags/business-logic/store/featureFlagSlice";

type CatalogSource<N extends FlagName> = (typeof flagCatalog)[N]["source"];

/**
 * Typed per catalog source: pass an env flag name → env resolution only;
 * pass a server flag name → server resolution only. Crossing sources is a
 * type error at the call site when using the Env/Server overloads below.
 */
export function useFeatureFlag(name: EnvFlagName): boolean;
export function useFeatureFlag(name: ServerFlagName): boolean;
export function useFeatureFlag(name: FlagName): boolean;
export function useFeatureFlag(name: FlagName): boolean {
  const serverValues = useAppStore((s) => s.featureFlagServerValues);
  const devOverrides = useAppStore((s) => s.featureFlagDevOverrides);

  return resolveFeatureFlag(name, {
    featureFlagServerValues: serverValues,
    featureFlagDevOverrides: devOverrides,
  }).isEnabled;
}

/** Compile-time guard helpers for call sites that must stay source-pure. */
export const assertEnvFlag = <N extends FlagName>(
  name: N,
): CatalogSource<N> extends "env" ? N : never => {
  if (flagCatalog[name].source !== "env") {
    throw new Error(`Flag ${name} is not an env flag`);
  }
  return name as CatalogSource<N> extends "env" ? N : never;
};

export const assertServerFlag = <N extends FlagName>(
  name: N,
): CatalogSource<N> extends "server" ? N : never => {
  if (flagCatalog[name].source !== "server") {
    throw new Error(`Flag ${name} is not a server flag`);
  }
  return name as CatalogSource<N> extends "server" ? N : never;
};

export const useFeatureFlagManager = () => {
  const serverValues = useAppStore((s) => s.featureFlagServerValues);
  const devOverrides = useAppStore((s) => s.featureFlagDevOverrides);
  const updateServerFeatureFlags = useAppStore(
    (s) => s.updateServerFeatureFlags,
  );
  const setFeatureFlagDevOverride = useAppStore(
    (s) => s.setFeatureFlagDevOverride,
  );
  const clearFeatureFlagDevOverrides = useAppStore(
    (s) => s.clearFeatureFlagDevOverrides,
  );

  const flags = useMemo(() => {
    const layers = {
      featureFlagServerValues: serverValues,
      featureFlagDevOverrides: devOverrides,
    };
    return FLAG_NAMES.reduce(
      (all, flag) => {
        all[flag] = resolveFeatureFlag(flag, layers);
        return all;
      },
      {} as Record<FlagName, ResolvedFeatureFlag>,
    );
  }, [serverValues, devOverrides]);

  const isEnabled = useCallback(
    (flag: FlagName) => flags[flag].isEnabled,
    [flags],
  );

  return {
    flags,
    isEnabled,
    devOverrides,
    updateServerFeatureFlags,
    setDevOverride: setFeatureFlagDevOverride,
    clearDevOverrides: clearFeatureFlagDevOverrides,
  };
};
