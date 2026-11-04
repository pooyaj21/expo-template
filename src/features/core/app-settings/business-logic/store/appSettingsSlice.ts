import { create, StateCreator } from "zustand";
import { AppSettingsInterface } from "@/features/core/app-settings/data-access/appSettingsTypes";

interface AppSettingsState {
  settings?: AppSettingsInterface;
  updateSettings: (settings?: AppSettingsInterface) => void;
  clearSettings: () => void;
}

const createAppSettingsSlice: StateCreator<AppSettingsState> = (set) => ({
  settings: undefined,
  updateSettings: (settings) => set({ settings }),
  clearSettings: () => set({ settings: undefined }),
});

// Not persisted: `GET /app/settings` runs on every boot, and a stale cached copy
// of force-update or support data is worse than none.
export const useAppSettingsStore = create<AppSettingsState>()((...a) => ({
  ...createAppSettingsSlice(...a),
}));
