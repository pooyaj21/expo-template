import en from "@/common/business-logic/localization/en.json";
import ar from "@/common/business-logic/localization/ar.json";
import type {
  AppLanguage,
  MessageKey,
} from "@/common/business-logic/localization/localizationTypes";

const catalogs: Record<AppLanguage, Record<MessageKey, string>> = {
  en: en as Record<MessageKey, string>,
  ar: ar as Record<MessageKey, string>,
};

export const resolveString = (language: AppLanguage, key: MessageKey): string =>
  catalogs[language][key] ?? catalogs.en[key] ?? key;

export const resolveStringWithReplacement = (
  language: AppLanguage,
  key: MessageKey,
  ...params: string[]
): string => {
  let value = resolveString(language, key);
  params.forEach((param, index) => {
    value = value.split(`[##p${index}]`).join(param);
  });
  return value;
};
