export type LanguageKey = "en" | "ar";

export type Language = {
  id: number;
  key: LanguageKey;
  title: string;
  nativeTitle: string;
  direction: "ltr" | "rtl";
};

export const languages: Language[] = [
  {
    id: 1,
    key: "en",
    title: "English",
    nativeTitle: "English",
    direction: "ltr",
  },
  {
    id: 2,
    key: "ar",
    title: "Arabic",
    nativeTitle: "العربية",
    direction: "rtl",
  },
];

export const DEFAULT_LANGUAGE: LanguageKey = "en";
