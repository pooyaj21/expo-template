import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet, View } from "react-native";
import { appStorage } from "@/common/business-logic/interfaces/storageInterface";
import { setQueryScope } from "@/common/business-logic/hooks/queryScopeRegistry";
import { detectLanguageFromLocale } from "@/common/business-logic/localization/deviceLocale";
import type {
  AppLanguage,
  MessageKey,
  TextDirection,
} from "@/common/business-logic/localization/localizationTypes";
import {
  resolveString,
  resolveStringWithReplacement,
} from "@/common/business-logic/localization/localizationStrings";
import {
  LocalizationContext,
  type LocalizationApi,
} from "@/common/business-logic/hooks/useLocalization";

const LANGUAGE_STORAGE_KEY = "language";
const SUPPORTED_LANGUAGES = ["en", "ar"] as const;

type LocalizationProviderProps = {
  children: ReactNode;
};

export const LocalizationProvider = ({
  children,
}: LocalizationProviderProps) => {
  const [language, setLanguageState] = useState<AppLanguage>("en");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hydrateLanguage = async () => {
      const stored = await appStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (cancelled) return;

      if (stored === "en" || stored === "ar") {
        setLanguageState(stored);
        setQueryScope({ language: stored });
      } else {
        const detected = detectLanguageFromLocale(SUPPORTED_LANGUAGES, "en");
        setLanguageState(detected);
        setQueryScope({ language: detected });
        await appStorage.setItem(LANGUAGE_STORAGE_KEY, detected);
      }

      if (!cancelled) {
        setLoaded(true);
      }
    };

    void hydrateLanguage();

    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (next: AppLanguage) => {
    const value: AppLanguage = next === "ar" ? "ar" : "en";
    setLanguageState(value);
    setQueryScope({ language: value });
    await appStorage.setItem(LANGUAGE_STORAGE_KEY, value);
  }, []);

  const getString = useCallback(
    (key: MessageKey) => resolveString(language, key),
    [language],
  );

  const getStringWithReplacement = useCallback(
    (key: MessageKey, ...params: string[]) =>
      resolveStringWithReplacement(language, key, ...params),
    [language],
  );

  const getDirection = useCallback(
    (): TextDirection => (language === "ar" ? "rtl" : "ltr"),
    [language],
  );

  const isRTL = language === "ar";

  const value = useMemo<LocalizationApi>(
    () => ({
      language,
      setLanguage,
      getString,
      getStringWithReplacement,
      getDirection,
      isRTL,
      loaded,
    }),
    [
      language,
      setLanguage,
      getString,
      getStringWithReplacement,
      getDirection,
      isRTL,
      loaded,
    ],
  );

  const rootStyle = useMemo(
    () => [
      { direction: getDirection() as "ltr" | "rtl" },
      StyleSheet.absoluteFillObject,
    ],
    [getDirection],
  );

  return (
    <LocalizationContext.Provider value={value}>
      <View style={rootStyle}>{children}</View>
    </LocalizationContext.Provider>
  );
};
