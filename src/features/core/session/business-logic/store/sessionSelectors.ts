import { useSessionStore } from "@/features/core/session/business-logic/store/sessionSlice";

/**
 * One hook per field. Subscribing to the whole store re-renders a component on
 * every unrelated change, so components never call `useSessionStore()` bare.
 */
export const useSessionStoreToken = () => useSessionStore((s) => s.token);
export const useSessionStoreUser = () => useSessionStore((s) => s.user);
export const useSessionStoreSet = () => useSessionStore((s) => s.setSession);
export const useSessionStoreSetUser = () => useSessionStore((s) => s.setUser);
export const useSessionStoreClear = () =>
  useSessionStore((s) => s.clearSession);
