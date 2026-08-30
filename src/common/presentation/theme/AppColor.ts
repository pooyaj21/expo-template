export type AppColor = typeof LightColors;

/**
 * Raw ramps. Components never read `palette` — they read the semantic tokens
 * below, so a rebrand is an edit here and nowhere else.
 */
const palette = {
  primary: {
    0: "#FFFFFF",
    50: "#EEF4FF",
    100: "#DCE8FF",
    200: "#B9D1FF",
    300: "#8DB2FF",
    400: "#5B8DF7",
    500: "#3366E6",
    600: "#254FBF",
    700: "#1B3C96",
    800: "#152E73",
    900: "#0E2050",
  },
  secondary: {
    0: "#FFFFFF",
    50: "#FFF6ED",
    100: "#FFEAD5",
    200: "#FDD0A8",
    300: "#FBB474",
    400: "#F9913D",
    500: "#F27212",
    600: "#D65C0B",
    700: "#B24A0C",
    800: "#8E3B10",
    900: "#74320F",
  },
  grey: {
    0: "#E6E6E6",
    50: "#F7F7F7",
    100: "#B3B3B3",
    200: "#858585",
    300: "#5A5A5A",
    400: "#4B4B4B",
    500: "#1B1B1B",
    600: "#111111",
    700: "#0D0D0D",
    800: "#0A0A0A",
    900: "#050505",
  },
};

export const LightColors = {
  text: {
    primary: palette.grey[500],
    secondary: palette.grey[300],
    disabled: palette.grey[100],
    placeholder: palette.grey[200],
    contrast: "#FFFFFF",
  },

  primary: {
    ...palette.primary,
    main: palette.primary[500],
    dark: palette.primary[700],
    light: palette.primary[50],
    contrast: "#FFFFFF",
  },

  secondary: {
    ...palette.secondary,
    main: palette.secondary[500],
    dark: palette.secondary[700],
    light: palette.secondary[100],
    contrast: "#FFFFFF",
  },

  error: {
    main: "#D32F2F",
    dark: "#C62828",
    light: "#FDEDED",
    contrast: "#FFFFFF",
  },
  warning: {
    main: "#ED6C02",
    dark: "#E65100",
    light: "#FFF4E5",
    contrast: "#FFFFFF",
  },
  info: {
    main: "#0288D1",
    dark: "#01579B",
    light: "#E5F6FD",
    contrast: "#FFFFFF",
  },
  success: {
    main: "#2E7D32",
    dark: "#1B5E20",
    light: "#EDF7ED",
    contrast: "#FFFFFF",
  },

  background: {
    main: "#F0F0F0",
    level1: "#F8F8F9",
    level2: "#FAFAFA",
    white: "#FFFFFF",
  },

  border: {
    light: palette.grey[0],
    default: palette.grey[100],
    dark: palette.grey[200],
  },

  divider: "#E2E2E2",

  button: {
    primary: {
      main: palette.primary[500],
      hover: palette.primary[600],
      focus: palette.primary[700],
      disabled: "#E8E8E8",
    },
    secondary: {
      main: palette.secondary[500],
      hover: palette.secondary[600],
      focus: palette.secondary[700],
      disabled: "#E8E8E8",
    },
  },

  grey: { ...palette.grey },
  white: "#FFFFFF",
  black: "#050505",
};

/** Translucency without hard-coding a second hex for the same colour. */
export const withAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
