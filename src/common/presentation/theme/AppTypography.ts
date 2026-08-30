import { TextStyle } from "react-native";
import { AppFont, FontFamily } from "@/common/presentation/theme/AppFont";

/**
 * Typography sets `writingDirection` but deliberately NOT `textAlign`.
 *
 * A physical `textAlign: "right"` fights the container: inside a mirrored
 * `flexDirection: "row"` the row already flips, so hard-aligning the text to a
 * physical edge pins it to the wrong side of its own flex box. Leaving
 * `textAlign` unset means "auto", which resolves to the *start* of the active
 * direction — left in English, right in Arabic — which is what almost every
 * layout wants. Override it explicitly (`textAlign: "center"`) where a design
 * genuinely calls for it.
 */
export type StyleTypography = TextStyle & {
  fontFamily?: FontFamily;
  fontWeight?: TextStyle["fontWeight"];
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
  light: TypographySize;
  regular: TypographySize;
  medium: TypographySize;
  semiBold: TypographySize;
  bold: TypographySize;
  custom: TypographyStyle;
};

/** The canonical ramp. Off-ramp sizes still work — see the Proxy below. */
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

const sizeScale = (
  fontFamily: FontFamily | undefined,
  fontWeight: TextStyle["fontWeight"],
  isRtl: boolean,
): TypographySize => {
  const scale = FONT_SIZES.reduce((acc, { size, lineHeight }) => {
    acc[size] = {
      fontFamily,
      fontWeight,
      fontSize: size,
      lineHeight,
      writingDirection: isRtl ? "rtl" : "ltr",
    };
    return acc;
  }, {} as TypographySize);

  // A size outside the ramp still renders correctly instead of returning
  // undefined and collapsing the text style.
  return new Proxy(scale, {
    get(target, prop) {
      const key = Number(prop);
      if (target[key]) return target[key];
      return {
        fontFamily,
        fontWeight,
        fontSize: key,
        writingDirection: isRtl ? "rtl" : "ltr",
      };
    },
  });
};

const namedStyles = (fonts: AppFont, isRtl: boolean): TypographyStyle => {
  const base: TextStyle = {
    writingDirection: isRtl ? "rtl" : "ltr",
  };
  return {
    h1: {
      ...base,
      fontFamily: fonts.bold,
      fontWeight: "700",
      fontSize: 40,
      lineHeight: 52,
    },
    h2: {
      ...base,
      fontFamily: fonts.bold,
      fontWeight: "700",
      fontSize: 32,
      lineHeight: 46,
    },
    h3: {
      ...base,
      fontFamily: fonts.semiBold,
      fontWeight: "600",
      fontSize: 28,
      lineHeight: 40,
    },
    h4: {
      ...base,
      fontFamily: fonts.semiBold,
      fontWeight: "600",
      fontSize: 24,
      lineHeight: 36,
    },
    h5: {
      ...base,
      fontFamily: fonts.medium,
      fontWeight: "500",
      fontSize: 20,
      lineHeight: 32,
    },
    h6: {
      ...base,
      fontFamily: fonts.medium,
      fontWeight: "500",
      fontSize: 18,
      lineHeight: 28,
    },
    subtitle1: {
      ...base,
      fontFamily: fonts.medium,
      fontWeight: "500",
      fontSize: 16,
      lineHeight: 24,
    },
    subtitle2: {
      ...base,
      fontFamily: fonts.medium,
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 22,
    },
    body1: {
      ...base,
      fontFamily: fonts.regular,
      fontWeight: "400",
      fontSize: 16,
      lineHeight: 24,
    },
    body2: {
      ...base,
      fontFamily: fonts.regular,
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 22,
    },
    caption: {
      ...base,
      fontFamily: fonts.regular,
      fontWeight: "400",
      fontSize: 12,
      lineHeight: 18,
    },
    overline: {
      ...base,
      fontFamily: fonts.medium,
      fontWeight: "500",
      fontSize: 10,
      lineHeight: 16,
      letterSpacing: 1,
    },
  };
};

export const AppTypographyBuilder = (
  fonts: AppFont,
  isRtl: boolean,
): AppTypography => ({
  light: sizeScale(fonts.light, "300", isRtl),
  regular: sizeScale(fonts.regular, "400", isRtl),
  medium: sizeScale(fonts.medium, "500", isRtl),
  semiBold: sizeScale(fonts.semiBold, "600", isRtl),
  bold: sizeScale(fonts.bold, "700", isRtl),
  custom: namedStyles(fonts, isRtl),
});
