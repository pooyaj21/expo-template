import type { TextStyle } from "react-native";
import type { AppFont, FontFamily } from "@/common/presentation/token/fonts";

export type StyleTypography = TextStyle & {
  fontFamily: FontFamily;
  fontWeight: TextStyle["fontWeight"];
  fontSize: number;
  lineHeight?: number;
};

export type TypographySize = Record<number, StyleTypography>;

type StyleName =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "caption"
  | "overline";

export type TypographyStyle = Record<StyleName, StyleTypography>;

export type AppTypography = {
  regular: TypographySize;
  medium: TypographySize;
  semiBold: TypographySize;
  bold: TypographySize;
  custom: TypographyStyle;
};

const FONT_SIZES = [
  { size: 10, lineHeight: 16 },
  { size: 12, lineHeight: 18 },
  { size: 13, lineHeight: 20 },
  { size: 14, lineHeight: 22 },
  { size: 16, lineHeight: 24 },
  { size: 18, lineHeight: 28 },
  { size: 20, lineHeight: 32 },
  { size: 24, lineHeight: 36 },
  { size: 28, lineHeight: 40 },
  { size: 32, lineHeight: 46 },
  { size: 36, lineHeight: 50 },
  { size: 40, lineHeight: 52 },
];

const sizeTypographyBuilder = (
  fontFamily: FontFamily,
  fontWeight: TextStyle["fontWeight"],
  isRtl: boolean,
): TypographySize => {
  const typographyObj = FONT_SIZES.reduce<TypographySize>(
    (acc, { size, lineHeight }) => {
      acc[size] = {
        fontFamily,
        fontWeight,
        fontSize: size,
        lineHeight,
        writingDirection: isRtl ? "rtl" : "ltr",
      };
      return acc;
    },
    {} as TypographySize,
  );

  return new Proxy(typographyObj, {
    get(target, prop: string | symbol) {
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop);
      }
      const key = Number(prop);
      if (target[key]) {
        return target[key];
      }
      return {
        fontFamily,
        fontWeight,
        fontSize: Number.isFinite(key) ? key : 14,
        writingDirection: isRtl ? "rtl" : "ltr",
      };
    },
  });
};

const styleTypographyBuilder = (
  fonts: AppFont,
  isRtl: boolean,
): TypographyStyle => {
  const baseStyle: TextStyle = {
    writingDirection: isRtl ? "rtl" : "ltr",
  };

  return {
    h1: {
      ...baseStyle,
      fontWeight: "400",
      fontFamily: fonts.regular,
      fontSize: 96,
      lineHeight: 112.32,
      letterSpacing: -1,
    },
    h2: {
      ...baseStyle,
      fontWeight: "400",
      fontFamily: fonts.regular,
      fontSize: 60,
      lineHeight: 72,
      letterSpacing: -0.5,
    },
    h3: {
      ...baseStyle,
      fontWeight: "400",
      fontFamily: fonts.regular,
      fontSize: 48,
      lineHeight: 56.16,
      letterSpacing: 0,
    },
    h4: {
      ...baseStyle,
      fontWeight: "400",
      fontFamily: fonts.regular,
      fontSize: 34,
      lineHeight: 42.16,
      letterSpacing: 0.25,
    },
    h5: {
      ...baseStyle,
      fontWeight: "500",
      fontFamily: fonts.medium,
      fontSize: 24,
      lineHeight: 31.92,
      letterSpacing: 0,
    },
    h6: {
      ...baseStyle,
      fontWeight: "500",
      fontFamily: fonts.medium,
      fontSize: 20,
      lineHeight: 32,
      letterSpacing: 0.15,
    },
    subtitle1: {
      ...baseStyle,
      fontWeight: "400",
      fontFamily: fonts.regular,
      fontSize: 16,
      lineHeight: 28,
      letterSpacing: 0.15,
    },
    subtitle2: {
      ...baseStyle,
      fontWeight: "500",
      fontFamily: fonts.medium,
      fontSize: 14,
      lineHeight: 21.98,
      letterSpacing: 0.1,
    },
    body1: {
      ...baseStyle,
      fontWeight: "400",
      fontFamily: fonts.regular,
      fontSize: 14,
      lineHeight: 19.6,
      letterSpacing: 0.15,
    },
    body2: {
      ...baseStyle,
      fontWeight: "500",
      fontFamily: fonts.medium,
      fontSize: 14,
      lineHeight: 19.6,
      letterSpacing: 0.15,
    },
    caption: {
      ...baseStyle,
      fontWeight: "400",
      fontFamily: fonts.regular,
      fontSize: 12,
      lineHeight: 19.92,
      letterSpacing: 0.4,
    },
    overline: {
      ...baseStyle,
      fontWeight: "400",
      fontFamily: fonts.regular,
      fontSize: 12,
      lineHeight: 31.92,
      letterSpacing: 1,
    },
  };
};

export const buildTypography = (
  fonts: AppFont,
  isRtl: boolean,
): AppTypography => ({
  regular: sizeTypographyBuilder(fonts.regular, "400", isRtl),
  medium: sizeTypographyBuilder(fonts.medium, "500", isRtl),
  semiBold: sizeTypographyBuilder(fonts.semiBold, "600", isRtl),
  bold: sizeTypographyBuilder(fonts.bold, "700", isRtl),
  custom: styleTypographyBuilder(fonts, isRtl),
});
