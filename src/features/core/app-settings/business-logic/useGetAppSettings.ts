import { useEffect } from "react";
import { useAppSettingsQuery } from "@/features/core/app-settings/data-access/appSettingsQueries";
import { useAppSettingsManager } from "@/features/core/app-settings/business-logic/useAppSettingsManager";
import { useFeatureFlagManager } from "@/features/core/feature-flags/business-logic/useFeatureFlagManager";

/**
 * Bootstrap settings (`GET /app/settings`). Unauthenticated — it runs for guests
 * too, so the flags and the support/force-update blocks hydrate before login.
 * The response is mirrored into the stores that own each slice; callers only
 * need the gating state. Failure must not block boot.
 */
export const useGetAppSettings = (options?: { enabled?: boolean }) => {
  const { data, isLoading, isFetching, isSuccess, isError, error, refetch } =
    useAppSettingsQuery({ enabled: options?.enabled });

  const { updateSettings } = useAppSettingsManager();
  const { updateServerFlags } = useFeatureFlagManager();

  useEffect(() => {
    const settings = data?.data;
    if (!settings) return;
    updateSettings(settings);
    // Replaces the whole server layer: a flag the backend stopped sending has
    // to fall back to env/default, not keep the last value it was given.
    updateServerFlags(settings.feature_flags ?? {});
  }, [data?.data, updateSettings, updateServerFlags]);

  return {
    data: data?.data,
    isLoading: isLoading || (isFetching && data == null),
    isSuccess,
    isError,
    error,
    refetch,
  };
};
