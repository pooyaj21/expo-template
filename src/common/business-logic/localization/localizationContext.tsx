import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getLocales } from "expo-localization";
import { Storage } from "@/common/data-access/storage/storage";
import { StorageKeys } from "@/common/data-access/storage/storageKeys";
import {
  DEFAULT_LANGUAGE,
  Language,
  LanguageKey,
  languages,
} from "@/common/data-access/localization/localizationTypes";
import {
  AppStringKey,
  AppStrings,
} from "@/common/data-access/localization/strings";

type LocalizationContextType = {
  /** False until the stored language has been read — the splash waits on this. */
  loaded: boolean;
  languages: Language[];
  activeLanguage: Language;
  direction: "ltr" | "rtl";
  isRtl: boolean;
  getString: (key: AppStringKey) => string;
  setActiveLanguage: (key: LanguageKey) => void;
};

const LocalizationContext = createContext<LocalizationContextType | null>(null);

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context == null) {
    throw new Error("useLocalization must be used inside LocalizationProvider");
  }
  return context;
}

const detectDeviceLanguage = (): LanguageKey => {
  const code = getLocales()[0]?.languageCode;
  return languages.some((item) => item.key === code)
    ? (code as LanguageKey)
    : DEFAULT_LANGUAGE;
};

/**
 * Owns the active language. Read by the theme (font per script), the API client
 * (`language` header) and the query scope (cache per language), so it sits
 * near the root of the provider tree.
 */
export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [loaded, setLoaded] = useState(false);
  const [language, setLanguage] = useState<LanguageKey>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const load = async () => {
      const stored = (await Storage.get(
        StorageKeys.LANGUAGE,
      )) as LanguageKey | null;
      setLanguage(stored ?? detectDeviceLanguage());
    };
    void load().finally(() => setLoaded(true));
  }, []);

  // Keep the non-React mirror in step, so the API header provider and any
  // other out-of-tree reader never lag a language switch.
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const setActiveLanguage = useCallback((key: LanguageKey) => {
    setLanguage(key);
    void Storage.set(StorageKeys.LANGUAGE, key);
  }, []);

  const value = useMemo<LocalizationContextType>(() => {
    const activeLanguage =
      languages.find((item) => item.key === language) ?? languages[0];

    return {
      loaded,
      languages,
      activeLanguage,
      direction: activeLanguage.direction,
      isRtl: activeLanguage.direction === "rtl",
      getString: (key: AppStringKey) =>
        AppStrings[key]?.[activeLanguage.key] ?? key,
      setActiveLanguage,
    };
  }, [language, loaded, setActiveLanguage]);

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

/** Read the active language outside React (interceptors, registries). */
export const languageRef: { current: LanguageKey } = {
  current: DEFAULT_LANGUAGE,
};
