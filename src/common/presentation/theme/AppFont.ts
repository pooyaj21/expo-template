/**
 * Per-language font families.
 *
 * The template ships with no font binaries, so both languages resolve to the
 * platform font. To use a real family: drop the files in
 * `assets/fonts/<lang>/`, add each face to `FontFiles`, and swap the names in
 * `AppFonts`. Nothing else in the app changes — components only ever read
 * `typography.*`.
 */
export type FontFamily = string;

/** e.g. `{ "Inter-Bold": require("@/assets/fonts/en/Inter-Bold.ttf") }` */
export const FontFiles: Record<string, number> = {};

export type AppFont = {
  light: FontFamily;
  regular: FontFamily;
  medium: FontFamily;
  semiBold: FontFamily;
  bold: FontFamily;
};

/** `undefined` family = the platform default (San Francisco / Roboto). */
const systemFont: AppFont = {
  light: undefined as unknown as FontFamily,
  regular: undefined as unknown as FontFamily,
  medium: undefined as unknown as FontFamily,
  semiBold: undefined as unknown as FontFamily,
  bold: undefined as unknown as FontFamily,
};

export const AppFonts: Record<string, AppFont> = {
  en: systemFont,
  ar: systemFont,
};
