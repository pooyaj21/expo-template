import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { appStorage } from "@/common/business-logic/interfaces/storageInterface";
import {
  createFeatureFlagSlice,
  FeatureFlagSlice,
} from "@/features/core/feature-flags/business-logic/store/featureFlagSlice";
import {
  createExampleFavoritesSlice,
  ExampleFavoritesSlice,
} from "@/features/example/business-logic/store/exampleFavoritesSlice";

/**
 * Composed client store. Each feature owns its slice under
 * `features/<feature>/business-logic/store/` and registers it here.
 *
 * This file is the ONLY allowed `common/` → `features/` import site.
 */
export type AppState = FeatureFlagSlice & ExampleFavoritesSlice;

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createFeatureFlagSlice(...a),
      ...createExampleFavoritesSlice(...a),
    }),
    {
      name: "app-state",
      storage: createJSONStorage(() => appStorage),
      partialize: (state) => ({
        featureFlagDevOverrides: state.featureFlagDevOverrides,
        exampleFavoriteIds: state.exampleFavoriteIds,
      }),
    },
  ),
);
