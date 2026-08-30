import { QueryClient } from "@tanstack/react-query";

/**
 * One client for the app. Retries are off by default: a failed request has
 * already been announced on the error channel, and silent retries make a
 * broken endpoint look like a slow one.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
