import { useEffect } from "react";
import { setupOnlineManager } from "@/common/data-access/api/setupQueryManagers";

/**
 * Ensures NetInfo → React Query `onlineManager` is wired. Prefer calling
 * `setupQueryManagers()` once from the root layout; this hook is for trees that
 * cannot run that setup imperatively.
 */
export const useOnlineManager = (): void => {
  useEffect(() => {
    setupOnlineManager();
  }, []);
};
