import { InternalAxiosRequestConfig } from "axios";

/**
 * Registry of per-request header providers.
 *
 * Without it the API client would import the session, country and device
 * concerns directly — the kernel depending on features, and endpoint trivia
 * ("don't send a Device-Id while registering a device") living in the client.
 * Instead each slice registers a provider and the client knows nothing about
 * auth, geography or devices.
 *
 * Providers register at module load; `CoreBootstrap` side-effect-imports them
 * so registration happens before any component can fire a request.
 */
export type RequestHeaderProvider = (
  config: InternalAxiosRequestConfig,
) => Promise<Record<string, string>> | Record<string, string>;

/** Keyed so re-registering (fast refresh, double mount) replaces, not duplicates. */
const providers = new Map<string, RequestHeaderProvider>();

export function registerRequestHeaderProvider(
  name: string,
  provider: RequestHeaderProvider,
): void {
  providers.set(name, provider);
}

/**
 * Resolve every registered provider for one request. Providers run in
 * registration order and a later one may overwrite an earlier key, so keep one
 * owner per header. A provider that throws is skipped rather than failing the
 * request — a missing optional header beats a request that never leaves.
 */
export async function resolveRequestHeaders(
  config: InternalAxiosRequestConfig,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  for (const [name, provider] of providers) {
    try {
      Object.assign(headers, await provider(config));
    } catch (error) {
      if (__DEV__)
        console.warn(`[api] header provider "${name}" failed:`, error);
    }
  }

  return headers;
}
