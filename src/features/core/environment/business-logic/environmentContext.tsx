import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Storage } from "@/common/data-access/storage/storage";
import { StorageKeys } from "@/common/data-access/storage/storageKeys";
import {
  defaultEnvironment,
  Environment,
  environments,
  LOCAL_ENVIRONMENT_ID,
} from "@/features/core/environment/data-access/environmentTypes";

type EnvironmentContextType = {
  loaded: boolean;
  environments: Environment[];
  selectedEnvironment: Environment;
  /** Resolved base URL, including the local override when Local is selected. */
  baseUrl: string;
  localUrl?: string;
  selectEnvironment: (id: number) => void;
  setLocalUrl: (url?: string) => void;
};

const EnvironmentContext = createContext<EnvironmentContextType | null>(null);

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (context == null) {
    throw new Error("useEnvironment must be used inside EnvironmentProvider");
  }
  return context;
}

/**
 * Which backend the app talks to. Kept switchable at runtime (behind the debug
 * screen) because QA should not need a new build to move between stage and dev.
 */
export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [loaded, setLoaded] = useState(false);
  const [environmentId, setEnvironmentId] = useState(defaultEnvironment().id);
  const [localUrl, setLocalUrlState] = useState<string | undefined>();

  useEffect(() => {
    const load = async () => {
      const [storedId, storedLocalUrl] = await Promise.all([
        Storage.get(StorageKeys.ENVIRONMENT),
        Storage.get(StorageKeys.LOCAL_API_URL),
      ]);
      if (storedId) setEnvironmentId(Number.parseInt(storedId, 10));
      if (storedLocalUrl) setLocalUrlState(storedLocalUrl);
    };
    void load().finally(() => setLoaded(true));
  }, []);

  const selectEnvironment = useCallback((id: number) => {
    setEnvironmentId(id);
    void Storage.set(StorageKeys.ENVIRONMENT, id.toString());
  }, []);

  const setLocalUrl = useCallback((url?: string) => {
    setLocalUrlState(url);
    if (url) void Storage.set(StorageKeys.LOCAL_API_URL, url);
    else void Storage.remove(StorageKeys.LOCAL_API_URL);
  }, []);

  const value = useMemo<EnvironmentContextType>(() => {
    const selectedEnvironment =
      environments.find((item) => item.id === environmentId) ??
      defaultEnvironment();

    const baseUrl =
      selectedEnvironment.id === LOCAL_ENVIRONMENT_ID && localUrl
        ? localUrl
        : selectedEnvironment.baseUrl;

    return {
      loaded,
      environments,
      selectedEnvironment,
      baseUrl,
      localUrl,
      selectEnvironment,
      setLocalUrl,
    };
  }, [environmentId, localUrl, loaded, selectEnvironment, setLocalUrl]);

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
};
