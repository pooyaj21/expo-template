export type DeviceLocaleInfo = {
  languageCode: string;
  countryCode: string | null;
  fullLocale: string;
};

export const getDeviceLocaleInfo = (): DeviceLocaleInfo => {
  const deviceLocale =
    Intl.DateTimeFormat().resolvedOptions().locale || "en-US";
  const localeParts = deviceLocale.split(/[-_]/);

  const languageCode = localeParts[0]?.toLowerCase() || "en";
  const countryCode =
    localeParts.length > 1
      ? localeParts[localeParts.length - 1].toUpperCase()
      : null;

  return {
    languageCode,
    countryCode,
    fullLocale: deviceLocale,
  };
};

export const detectLanguageFromLocale = <T extends string>(
  supportedLanguages: readonly T[] = ["en", "ar"] as unknown as readonly T[],
  defaultLanguage: T = "en" as T,
): T => {
  const { languageCode } = getDeviceLocaleInfo();

  if ((supportedLanguages as readonly string[]).includes(languageCode)) {
    return languageCode as T;
  }

  for (const supportedLang of supportedLanguages) {
    if (
      languageCode.startsWith(supportedLang) ||
      supportedLang.startsWith(languageCode)
    ) {
      return supportedLang;
    }
  }

  return defaultLanguage;
};
