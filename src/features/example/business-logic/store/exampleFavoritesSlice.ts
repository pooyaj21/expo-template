import { StateCreator } from "zustand";

export type ExampleFavoritesSlice = {
  exampleFavoriteIds: number[];
  toggleExampleFavorite: (id: number) => void;
  isExampleFavorite: (id: number) => boolean;
  clearExampleFavorites: () => void;
};

export const createExampleFavoritesSlice: StateCreator<
  ExampleFavoritesSlice,
  [],
  [],
  ExampleFavoritesSlice
> = (set, get) => ({
  exampleFavoriteIds: [],
  toggleExampleFavorite: (id) =>
    set((state) => {
      const exists = state.exampleFavoriteIds.includes(id);
      return {
        exampleFavoriteIds: exists
          ? state.exampleFavoriteIds.filter((value) => value !== id)
          : [...state.exampleFavoriteIds, id],
      };
    }),
  isExampleFavorite: (id) => get().exampleFavoriteIds.includes(id),
  clearExampleFavorites: () => set({ exampleFavoriteIds: [] }),
});
