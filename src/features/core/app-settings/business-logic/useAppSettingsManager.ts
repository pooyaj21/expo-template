import {
  useAppSettingsStoreClear,
  useAppSettingsStoreGet,
  useAppSettingsStoreUpdate,
} from "@/features/core/app-settings/business-logic/store/appSettingsSelectors";

export const useAppSettingsManager = () => {
  const settings = useAppSettingsStoreGet();
  const updateSettings = useAppSettingsStoreUpdate();
  const clearSettings = useAppSettingsStoreClear();

  return {
    settings,
    forceUpdate: settings?.force_update,
    support: settings?.support,
    updateSettings,
    clearSettings,
  };
};
