import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Without these, every screen/dialog mount refetches (staleTime 0) and
        // every foreground return refetches everything. Dialogs unmount on
        // dismiss, so each reopen was paying a full round-trip.
        staleTime: 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: (failureCount, error: unknown) => {
          const status =
            error instanceof AxiosError ? error.response?.status : undefined;
          if (status !== undefined && status >= 400 && status < 500) {
            return false;
          }
          return failureCount < 3;
        },
        // Driven by `setupFocusManager` / AppState → focusManager on RN.
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
  });

export const queryClient = createQueryClient();
