import type { AxiosError, InternalAxiosRequestConfig } from "axios";

const UNAUTHORIZED = 401;

/**
 * Returns `true` when tokens were refreshed and the failed request should be
 * retried once. Must not call `apiClient` for the refresh itself (or must use a
 * path that cannot 401-loop) — prefer a dedicated refresh client / fetch.
 */
export type AuthRefreshHandler = () => Promise<boolean>;

type RetriableConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
};

let authRefreshHandler: AuthRefreshHandler | null = null;
let inFlightRefresh: Promise<boolean> | null = null;

/**
 * Register (or clear with `null`) the single-flight 401 refresh handler.
 * A future session / auth slice owns the implementation; the API client only
 * invokes whatever is registered. Returns an unsubscribe that clears only if
 * this registration is still the active one.
 */
export const registerAuthRefreshHandler = (
  handler: AuthRefreshHandler | null,
): (() => void) => {
  authRefreshHandler = handler;
  return () => {
    if (authRefreshHandler === handler) {
      authRefreshHandler = null;
    }
  };
};

export const hasAuthRefreshHandler = (): boolean => authRefreshHandler != null;

export const runAuthRefreshSingleFlight = async (): Promise<boolean> => {
  if (authRefreshHandler == null) return false;

  if (inFlightRefresh == null) {
    const run = authRefreshHandler;
    inFlightRefresh = Promise.resolve()
      .then(() => run())
      .catch(() => false)
      .finally(() => {
        inFlightRefresh = null;
      });
  }

  return inFlightRefresh;
};

export const shouldAttemptAuthRefresh = (
  error: AxiosError,
): error is AxiosError & { config: RetriableConfig } => {
  const config = error.config as RetriableConfig | undefined;
  return (
    error.response?.status === UNAUTHORIZED &&
    authRefreshHandler != null &&
    config != null &&
    config._authRetry !== true
  );
};

export const markAuthRetry = (config: RetriableConfig): RetriableConfig => {
  config._authRetry = true;
  return config;
};
