const palette = {
  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },
  slate: {
    0: "#F8FAFC",
    50: "#F1F5F9",
    100: "#E2E8F0",
    200: "#CBD5E1",
    300: "#94A3B8",
    400: "#64748B",
    500: "#475569",
    600: "#334155",
    700: "#1E293B",
    800: "#0F172A",
    900: "#020617",
  },
  teal: {
    50: "#F0FDFA",
    100: "#CCFBF1",
    200: "#99F6E4",
    300: "#5EEAD4",
    400: "#2DD4BF",
    500: "#14B8A6",
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A",
  },
};

export const lightColors = {
  text: {
    primary: palette.slate[800],
    secondary: palette.slate[500],
    disabled: palette.slate[300],
    placeholder: palette.slate[400],
    contrast: "#FFFFFF",
  },

  primary: {
    ...palette.blue,
    main: palette.blue[600],
    dark: palette.blue[800],
    light: palette.blue[50],
    contrast: "#FFFFFF",
  },

  secondary: {
    ...palette.teal,
    main: palette.teal[600],
    dark: palette.teal[800],
    light: palette.teal[100],
    contrast: "#FFFFFF",
  },

  error: {
    main: "#DC2626",
    dark: "#B91C1C",
    light: "#FEE2E2",
    contrast: "#FFFFFF",
  },

  warning: {
    main: "#D97706",
    dark: "#B45309",
    light: "#FEF3C7",
    content: "#78350F",
    contrast: "#FFFFFF",
  },

  info: {
    main: "#2563EB",
    dark: "#1D4ED8",
    light: "#DBEAFE",
    contrast: "#FFFFFF",
  },

  success: {
    main: "#15803D",
    dark: "#166534",
    light: "#DCFCE7",
  },

  background: {
    main: palette.slate[50],
    level1: "#FFFFFF",
    level2: palette.slate[0],
    white: "#FFFFFF",
  },

  border: {
    light: palette.slate[100],
    default: palette.slate[200],
    dark: palette.slate[300],
  },

  divider: palette.slate[100],

  button: {
    primary: {
      main: palette.blue[600],
      hover: palette.blue[700],
      focus: palette.blue[800],
      disabled: palette.slate[100],
    },
    secondary: {
      main: palette.teal[600],
      hover: palette.teal[700],
      focus: palette.teal[800],
      disabled: palette.slate[100],
    },
  },

  grey: {
    ...palette.slate,
  },

  white: "#FFFFFF",
  black: "#020617",
};

export const darkColors: typeof lightColors = {
  text: {
    primary: palette.slate[50],
    secondary: palette.slate[300],
    disabled: palette.slate[500],
    placeholder: palette.slate[400],
    contrast: palette.slate[900],
  },

  primary: {
    ...palette.blue,
    main: palette.blue[400],
    dark: palette.blue[300],
    light: palette.blue[900],
    contrast: palette.slate[900],
  },

  secondary: {
    ...palette.teal,
    main: palette.teal[400],
    dark: palette.teal[300],
    light: palette.teal[900],
    contrast: palette.slate[900],
  },

  error: {
    main: "#F87171",
    dark: "#EF4444",
    light: "#7F1D1D",
    contrast: palette.slate[900],
  },

  warning: {
    main: "#FBBF24",
    dark: "#F59E0B",
    light: "#78350F",
    content: "#FEF3C7",
    contrast: palette.slate[900],
  },

  info: {
    main: "#60A5FA",
    dark: "#3B82F6",
    light: "#1E3A8A",
    contrast: palette.slate[900],
  },

  success: {
    main: "#4ADE80",
    dark: "#22C55E",
    light: "#14532D",
  },

  background: {
    main: palette.slate[900],
    level1: palette.slate[800],
    level2: palette.slate[700],
    white: palette.slate[800],
  },

  border: {
    light: palette.slate[700],
    default: palette.slate[600],
    dark: palette.slate[500],
  },

  divider: palette.slate[700],

  button: {
    primary: {
      main: palette.blue[500],
      hover: palette.blue[400],
      focus: palette.blue[300],
      disabled: palette.slate[700],
    },
    secondary: {
      main: palette.teal[500],
      hover: palette.teal[400],
      focus: palette.teal[300],
      disabled: palette.slate[700],
    },
  },

  grey: {
    ...palette.slate,
  },

  white: "#FFFFFF",
  black: "#020617",
};

export type AppColors = typeof lightColors;

export const withAlpha = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const mixColors = (from: string, to: string, ratio: number) => {
  const clamped = Math.min(Math.max(ratio, 0), 1);
  const channel = (index: number) => {
    const start = parseInt(from.slice(1 + index * 2, 3 + index * 2), 16);
    const end = parseInt(to.slice(1 + index * 2, 3 + index * 2), 16);
    const value = Math.round(start + (end - start) * clamped);
    return value.toString(16).padStart(2, "0");
  };
  return `#${channel(0)}${channel(1)}${channel(2)}`;
};
