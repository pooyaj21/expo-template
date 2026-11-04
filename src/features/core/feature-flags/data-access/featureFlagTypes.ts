// The flag catalog. Resolution order is dev override → server → env →
// default. Delete EXAMPLE once the first real flag lands — it exists so the
// plumbing has something to resolve.
export enum FeatureFlagEnums {
  EXAMPLE = "example",
}

export enum FeatureFlagSourceEnums {
  DEV_OVERRIDE = "devOverride",
  SERVER = "server",
  ENV = "env",
  DEFAULT = "default",
}

export type FeatureFlagValues = Partial<Record<FeatureFlagEnums, boolean>>;

export interface FeatureFlagInterface {
  flag: FeatureFlagEnums;
  isEnabled: boolean;
  source: FeatureFlagSourceEnums;
  devOverride?: boolean;
  serverValue?: boolean;
  envValue?: boolean;
}

export const FEATURE_FLAG_DEFAULTS: Readonly<
  Record<FeatureFlagEnums, boolean>
> = {
  [FeatureFlagEnums.EXAMPLE]: false,
};

export const FEATURE_FLAG_LIST: readonly FeatureFlagEnums[] =
  Object.values(FeatureFlagEnums);
