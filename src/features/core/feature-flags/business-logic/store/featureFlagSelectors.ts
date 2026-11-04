import { useFeatureFlagStore } from "@/features/core/feature-flags/business-logic/store/featureFlagSlice";

export const useFeatureFlagStoreGetServerFlags = () =>
  useFeatureFlagStore((state) => state.serverFlags);

export const useFeatureFlagStoreGetDevOverrides = () =>
  useFeatureFlagStore((state) => state.devOverrides);

export const useFeatureFlagStoreUpdateServerFlags = () =>
  useFeatureFlagStore((state) => state.updateServerFlags);

export const useFeatureFlagStoreSetDevOverride = () =>
  useFeatureFlagStore((state) => state.setDevOverride);

export const useFeatureFlagStoreClearDevOverrides = () =>
  useFeatureFlagStore((state) => state.clearDevOverrides);
