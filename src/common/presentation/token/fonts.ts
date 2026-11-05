export type FontFamily =
  | "Inter-Regular"
  | "Inter-Medium"
  | "Inter-SemiBold"
  | "Inter-Bold"
  | "IBMPlexSansArabic-Regular"
  | "IBMPlexSansArabic-Medium"
  | "IBMPlexSansArabic-SemiBold"
  | "IBMPlexSansArabic-Bold";

export const fontFiles: Record<FontFamily, number> = {
  "Inter-Regular": require("@assets/fonts/en/Inter-Regular.ttf"),
  "Inter-Medium": require("@assets/fonts/en/Inter-Medium.ttf"),
  "Inter-SemiBold": require("@assets/fonts/en/Inter-SemiBold.ttf"),
  "Inter-Bold": require("@assets/fonts/en/Inter-Bold.ttf"),
  "IBMPlexSansArabic-Regular": require("@assets/fonts/ar/IBMPlexSansArabic-Regular.ttf"),
  "IBMPlexSansArabic-Medium": require("@assets/fonts/ar/IBMPlexSansArabic-Medium.ttf"),
  "IBMPlexSansArabic-SemiBold": require("@assets/fonts/ar/IBMPlexSansArabic-SemiBold.ttf"),
  "IBMPlexSansArabic-Bold": require("@assets/fonts/ar/IBMPlexSansArabic-Bold.ttf"),
};

export type AppFont = {
  regular: FontFamily;
  medium: FontFamily;
  semiBold: FontFamily;
  bold: FontFamily;
};

export type AppLanguageCode = "en" | "ar";

export const fontMap: Record<AppLanguageCode, AppFont> = {
  en: {
    regular: "Inter-Regular",
    medium: "Inter-Medium",
    semiBold: "Inter-SemiBold",
    bold: "Inter-Bold",
  },
  ar: {
    regular: "IBMPlexSansArabic-Regular",
    medium: "IBMPlexSansArabic-Medium",
    semiBold: "IBMPlexSansArabic-SemiBold",
    bold: "IBMPlexSansArabic-Bold",
  },
};
