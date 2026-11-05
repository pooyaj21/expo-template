import { useCallback } from "react";
import { useAlerts } from "@/features/core/alerts/business-logic/alertContext";
import {
  useIsExampleFavorite,
  useToggleExampleFavorite,
} from "@/features/example/business-logic/store/exampleFavoritesSelectors";

/**
 * Toggles an example favorite and raises a success toast via the alerts queue.
 */
export const useExampleFavoriteToggle = (id: number) => {
  const isFavorite = useIsExampleFavorite(id);
  const toggleFavorite = useToggleExampleFavorite();
  const { showSuccess } = useAlerts();

  const toggle = useCallback(() => {
    const removing = isFavorite;
    toggleFavorite(id);
    showSuccess({
      messageKey: removing
        ? "example.favorites.removedToast"
        : "example.favorites.addedToast",
      dedupeKey: `example-favorite:${id}`,
    });
  }, [id, isFavorite, showSuccess, toggleFavorite]);

  return { isFavorite, toggle };
};
