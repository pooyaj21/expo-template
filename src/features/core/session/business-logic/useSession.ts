import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { tokenStorage } from "@/features/core/session/data-access/tokenStorage";
import { UserInterface } from "@/features/core/session/data-access/sessionTypes";
import {
  useSessionStoreClear,
  useSessionStoreSet,
  useSessionStoreSetUser,
  useSessionStoreToken,
  useSessionStoreUser,
} from "@/features/core/session/business-logic/store/sessionSelectors";
import { sessionRef } from "@/features/core/session/business-logic/sessionRef";

/**
 * The session surface every other feature consumes. Login use cases call
 * `signIn`; nothing reaches around it to the store or to secure storage,
 * because the token has three homes (store, keychain, header ref) and they
 * must move together.
 */
export const useSession = () => {
  const token = useSessionStoreToken();
  const user = useSessionStoreUser();
  const setSession = useSessionStoreSet();
  const setUser = useSessionStoreSetUser();
  const clearSession = useSessionStoreClear();
  const queryClient = useQueryClient();

  useEffect(() => {
    sessionRef.token = token ?? null;
  }, [token]);

  const hydrate = useCallback(async () => {
    const stored = await tokenStorage.read();
    if (stored) setSession(stored);
    else clearSession();
  }, [setSession, clearSession]);

  const signIn = useCallback(
    async (accessToken: string, nextUser?: UserInterface) => {
      await tokenStorage.write(accessToken);
      setSession(accessToken, nextUser);
      // Anything cached under the previous scope belonged to someone else.
      await queryClient.invalidateQueries();
    },
    [setSession, queryClient],
  );

  const signOut = useCallback(async () => {
    await tokenStorage.clear();
    clearSession();
    queryClient.clear();
  }, [clearSession, queryClient]);

  return {
    token: token ?? null,
    user,
    /** Undefined token means "still hydrating", which is not the same as signed out. */
    isHydrated: token !== undefined,
    isAuthenticated: Boolean(token),
    hydrate,
    signIn,
    signOut,
    setUser,
  };
};
