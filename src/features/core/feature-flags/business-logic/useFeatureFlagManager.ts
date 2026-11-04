import { useCallback, useMemo } from "react";
import {
  FEATURE_FLAG_LIST,
  FeatureFlagEnums,
  FeatureFlagInterface,
} from "@/features/core/feature-flags/data-access/featureFlagTypes";
import {
  useFeatureFlagStoreClearDevOverrides,
  useFeatureFlagStoreGetDevOverrides,
  useFeatureFlagStoreGetServerFlags,
  useFeatureFlagStoreSetDevOverride,
  useFeatureFlagStoreUpdateServerFlags,
} from "@/features/core/feature-flags/business-logic/store/featureFlagSelectors";
import { resolveFeatureFlag } from "@/features/core/feature-flags/business-logic/store/featureFlagSlice";

export const useFeatureFlagManager = () => {
  const serverFlags = useFeatureFlagStoreGetServerFlags();
  const devOverrides = useFeatureFlagStoreGetDevOverrides();
  const updateServerFlags = useFeatureFlagStoreUpdateServerFlags();
  const setDevOverride = useFeatureFlagStoreSetDevOverride();
  const clearDevOverrides = useFeatureFlagStoreClearDevOverrides();

  const flags = useMemo(
    () =>
      FEATURE_FLAG_LIST.reduce(
        (all, flag) => {
          all[flag] = resolveFeatureFlag(flag, { serverFlags, devOverrides });
          return all;
        },
        {} as Record<FeatureFlagEnums, FeatureFlagInterface>,
      ),
    [serverFlags, devOverrides],
  );

  const isEnabled = useCallback(
    (flag: FeatureFlagEnums) => flags[flag].isEnabled,
    [flags],
  );

  return {
    flags,
    isEnabled,
    updateServerFlags,
    setDevOverride,
    clearDevOverrides,
  };
};
