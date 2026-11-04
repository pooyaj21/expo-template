import { useAppSettingsStore } from "@/features/core/app-settings/business-logic/store/appSettingsSlice";

export const useAppSettingsStoreGet = () =>
  useAppSettingsStore((state) => state.settings);

export const useAppSettingsStoreUpdate = () =>
  useAppSettingsStore((state) => state.updateSettings);

export const useAppSettingsStoreClear = () =>
  useAppSettingsStore((state) => state.clearSettings);
