import { createContext, useContext } from "react";
import type { AppColors } from "@/common/presentation/token/colors";
import type { AppFont } from "@/common/presentation/token/fonts";
import type { AppTypography } from "@/common/presentation/token/typography";

export type AppThemeApi = {
  colors: AppColors;
  typography: AppTypography;
  fonts: AppFont;
  isDark: boolean;
  loaded: boolean;
};

export const AppThemeContext = createContext<AppThemeApi | null>(null);

export const useAppTheme = (): AppThemeApi => {
  const value = useContext(AppThemeContext);
  if (value == null) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return value;
};
