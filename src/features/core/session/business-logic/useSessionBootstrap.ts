import { useEffect } from "react";
import { apiErrorChannel } from "@/common/data-access/api/apiErrorChannel";
import { useSession } from "@/features/core/session/business-logic/useSession";

/**
 * Hydrates the session from secure storage and owns the app's reaction to a
 * 401: sign out. The alert bridge stays silent on 401 precisely because this
 * runs — one failure, one response.
 */
export const useSessionBootstrap = () => {
  const { hydrate, signOut, isAuthenticated, isHydrated } = useSession();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(
    () =>
      apiErrorChannel.subscribe((error) => {
        if (error.response?.status !== 401) return;
        if (!isAuthenticated) return;
        void signOut();
      }),
    [signOut, isAuthenticated],
  );

  return { isHydrated };
};
