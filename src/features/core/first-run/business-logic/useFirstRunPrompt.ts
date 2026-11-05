import { useCallback, useEffect, useSyncExternalStore } from "react";
import { firstRunManager } from "@/features/core/first-run/business-logic/firstRunManager";
import type { FirstRunPrompt } from "@/features/core/first-run/data-access/firstRunTypes";

/**
 * Observe whether a registered prompt id is the active one. Prefer rendering
 * through `FirstRunHost` + `registerFirstRunPrompt({ render })`; use this hook
 * when a screen needs the active flag without owning the surface.
 */
export const useFirstRunPrompt = (id: string): FirstRunPrompt => {
  useEffect(() => {
    void firstRunManager.ensureHydrated();
  }, []);

  const active = useSyncExternalStore(
    firstRunManager.subscribe,
    firstRunManager.getSnapshot,
    () => null,
  );

  const markSeen = useCallback(() => {
    void firstRunManager.markSeen(id);
  }, [id]);

  return {
    isActive: active === id,
    complete: markSeen,
    dismiss: markSeen,
  };
};
