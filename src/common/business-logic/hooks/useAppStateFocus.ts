import { useEffect } from "react";
import { setupFocusManager } from "@/common/data-access/api/setupQueryManagers";

/**
 * Ensures AppState → React Query `focusManager` is wired so foregrounding
 * refetches stale queries. Prefer `setupQueryManagers()` from the root layout.
 */
export const useAppStateFocus = (): void => {
  useEffect(() => {
    setupFocusManager();
  }, []);
};
