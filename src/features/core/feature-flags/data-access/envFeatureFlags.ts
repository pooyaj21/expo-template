import {
  FeatureFlagEnums,
  FeatureFlagValues,
} from "@/features/core/feature-flags/data-access/featureFlagTypes";

// A flag is an override only when it parses to a boolean. Unset, empty or
// misspelled leaves the decision to the server layer.
const featureFlag = (value: string | undefined): boolean | undefined => {
  const normalized = value?.toLowerCase().trim();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
};

export const envFeatureFlags: FeatureFlagValues = {
  [FeatureFlagEnums.EXAMPLE]: featureFlag(
    process.env.EXPO_PUBLIC_FLAG_EXAMPLE_ENABLED,
  ),
};
