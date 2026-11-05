import type { EnvFlagName } from "@/features/core/feature-flags/data-access/featureFlagTypes";

export type {
  FeatureFlagSource,
  FlagDefinition,
  FlagName,
  EnvFlagName,
  ServerFlagName,
} from "@/features/core/feature-flags/data-access/featureFlagTypes";

export {
  flagCatalog,
  FLAG_NAMES,
  ENV_FLAG_NAMES,
  SERVER_FLAG_NAMES,
} from "@/features/core/feature-flags/data-access/featureFlagTypes";

/**
 * Optional boolean from an env string. Unset / empty / misspelled → undefined
 * so the catalog default wins.
 */
export const parseOptionalFlag = (
  value: string | undefined,
): boolean | undefined => {
  const normalized = value?.toLowerCase().trim();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
};

/**
 * Literal process.env reads only — babel-preset-expo inlines these.
 * Computed keys would silently be undefined at runtime.
 */
export const envFlagValues: Record<EnvFlagName, boolean | undefined> = {
  EXAMPLE_DETAIL: parseOptionalFlag(
    process.env.EXPO_PUBLIC_FLAG_EXAMPLE_DETAIL,
  ),
};
