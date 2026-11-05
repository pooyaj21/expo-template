import en from "@/common/business-logic/localization/en.json";

export type MessageKey = keyof typeof en;

export type AppLanguage = "en" | "ar";

export type TextDirection = "ltr" | "rtl";
