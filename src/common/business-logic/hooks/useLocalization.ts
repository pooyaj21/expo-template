import { createContext, useContext } from "react";
import type {
  AppLanguage,
  MessageKey,
  TextDirection,
} from "@/common/business-logic/localization/localizationTypes";

export type LocalizationApi = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  getString: (key: MessageKey) => string;
  getStringWithReplacement: (key: MessageKey, ...params: string[]) => string;
  getDirection: () => TextDirection;
  isRTL: boolean;
  loaded: boolean;
};

export const LocalizationContext = createContext<LocalizationApi | null>(null);

export const useLocalization = (): LocalizationApi => {
  const value = useContext(LocalizationContext);
  if (value == null) {
    throw new Error("useLocalization must be used within LocalizationProvider");
  }
  return value;
};
