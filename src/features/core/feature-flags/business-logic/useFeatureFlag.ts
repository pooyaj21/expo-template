import { FeatureFlagEnums } from "@/features/core/feature-flags/data-access/featureFlagTypes";
import { useFeatureFlagManager } from "@/features/core/feature-flags/business-logic/useFeatureFlagManager";

export const useFeatureFlag = (flag: FeatureFlagEnums): boolean => {
  const { isEnabled } = useFeatureFlagManager();
  return isEnabled(flag);
};
