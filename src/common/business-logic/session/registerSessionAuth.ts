import {
  registerAuthRefreshHandler,
  type AuthRefreshHandler,
} from "@/common/data-access/api/authRefresh";
import { registerRequestHeaderProvider } from "@/common/data-access/api/requestHeaders";

export type SessionAuthRegistration = {
  /** Sync or async access-token reader used for the `Authorization` header. */
  getAccessToken: () => string | null | Promise<string | null>;
  /**
   * Single-flight refresh invoked on 401. Return `true` only when a new access
   * token is stored and the original request should be retried. Must not call
   * `apiClient` in a way that re-enters the 401 path.
   */
  refresh: AuthRefreshHandler;
};

/**
 * Kernel plug-in for a future session / auth slice: wires Bearer headers via
 * `requestHeaders` and the axios 401 refresh slot. Call once from that slice's
 * bootstrap (e.g. `CoreBootstrap` side-effect). Returns a combined unsubscribe.
 */
export const registerSessionAuth = ({
  getAccessToken,
  refresh,
}: SessionAuthRegistration): (() => void) => {
  const unregisterHeaders = registerRequestHeaderProvider(async () => {
    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  });

  const unregisterRefresh = registerAuthRefreshHandler(refresh);

  return () => {
    unregisterHeaders();
    unregisterRefresh();
  };
};
