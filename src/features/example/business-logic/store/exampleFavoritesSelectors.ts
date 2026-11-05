import { useAppStore } from "@/common/business-logic/store/app-state";

export const useExampleFavoriteIds = () =>
  useAppStore((state) => state.exampleFavoriteIds);

export const useIsExampleFavorite = (id: number) =>
  useAppStore((state) => state.exampleFavoriteIds.includes(id));

export const useToggleExampleFavorite = () =>
  useAppStore((state) => state.toggleExampleFavorite);
