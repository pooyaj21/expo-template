import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import { routes } from "@/common/business-logic/routes/paths";

/**
 * Hard reset helper for environment switches and recover-from-error flows.
 * Clears the query cache and remounts navigation at home.
 */
export const useResetApp = () => {
  const queryClient = useQueryClient();

  const resetApp = useCallback(async () => {
    queryClient.clear();
    await queryClient.resetQueries();
    router.dismissAll();
    router.replace(routes.home() as Href);
  }, [queryClient]);

  return { resetApp };
};
