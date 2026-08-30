import { createContext, ReactNode, useContext, useMemo } from "react";
import { AxiosInstance } from "axios";
import { createApiClient } from "@/common/data-access/api/apiClient";

const ApiClientContext = createContext<AxiosInstance | null>(null);

/**
 * The axios instance every query file uses. It is a context rather than a
 * module singleton because the base URL changes when the environment is
 * switched at runtime, and every consumer must pick that up.
 */
export function useApiClient() {
  const client = useContext(ApiClientContext);
  if (client == null) {
    throw new Error("useApiClient must be used inside ApiClientProvider");
  }
  return client;
}

type ApiClientProviderProps = {
  /** Passed in by the composition root — data-access must not read a slice. */
  baseUrl: string;
  children: ReactNode;
};

export const ApiClientProvider = ({
  baseUrl,
  children,
}: ApiClientProviderProps) => {
  const client = useMemo(() => createApiClient(baseUrl), [baseUrl]);

  return (
    <ApiClientContext.Provider value={client}>
      {children}
    </ApiClientContext.Provider>
  );
};
