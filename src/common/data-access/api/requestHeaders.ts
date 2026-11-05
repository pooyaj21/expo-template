export type RequestHeaderProvider = () =>
  | Record<string, string>
  | Promise<Record<string, string>>;

const providers = new Set<RequestHeaderProvider>();

/**
 * Register a per-request header provider. Returns an unsubscribe function.
 * Feature slices (session, device, locale, …) register here from bootstrap;
 * the API client never imports those slices.
 */
export const registerRequestHeaderProvider = (
  fn: RequestHeaderProvider,
): (() => void) => {
  providers.add(fn);
  return () => {
    providers.delete(fn);
  };
};

/**
 * Resolve every registered provider for one request. A provider that throws is
 * skipped rather than failing the request.
 */
export const resolveRequestHeaders = async (): Promise<
  Record<string, string>
> => {
  const headers: Record<string, string> = {};

  for (const provider of providers) {
    try {
      Object.assign(headers, await provider());
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[api] Header provider failed:", error);
      }
    }
  }

  return headers;
};
