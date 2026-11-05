import { useEffect, useState, useSyncExternalStore } from "react";
import { appSettingsManager } from "@/features/core/app-settings/business-logic/appSettingsManager";
import type { AppSettingsData } from "@/features/core/app-settings/data-access/appSettingsTypes";
import { DEFAULT_APP_SETTINGS } from "@/features/core/app-settings/data-access/appSettingsDefaults";

/**
 * Typed remote settings. Hydrates from the TTL cache, then `ensure()`s a
 * refresh when missing / expired / scope-mismatched.
 */
export const useAppSettings = (): {
  settings: AppSettingsData;
  isLoading: boolean;
  refresh: () => Promise<void>;
} => {
  const settings = useSyncExternalStore(
    appSettingsManager.subscribe,
    () => appSettingsManager.getSettings(),
    () => DEFAULT_APP_SETTINGS,
  );

  const [isLoading, setIsLoading] = useState(
    () => appSettingsManager.getCached() == null,
  );

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (appSettingsManager.getCached() == null) {
        setIsLoading(true);
      }
      await appSettingsManager.ensure();
      if (!cancelled) setIsLoading(false);
    };

    void refresh();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    settings,
    isLoading,
    refresh: async () => {
      setIsLoading(true);
      appSettingsManager.invalidate();
      await appSettingsManager.ensure();
      setIsLoading(false);
    },
  };
};
