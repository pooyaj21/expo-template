import { createContext, ReactNode, useContext, useMemo } from "react";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { AppColor, LightColors } from "@/common/presentation/theme/AppColor";
import {
  AppFont,
  AppFonts,
  FontFiles,
} from "@/common/presentation/theme/AppFont";
import {
  AppTypography,
  AppTypographyBuilder,
} from "@/common/presentation/theme/AppTypography";
import { useLocalization } from "@/common/business-logic/localization/localizationContext";

export type AppTheme = {
  loaded: boolean;
  dark: boolean;
  isRtl: boolean;
  fonts: AppFont;
  colors: AppColor;
  typography: AppTypography;
};

const AppThemeContext = createContext<AppTheme | null>(null);

export function useAppTheme() {
  const theme = useContext(AppThemeContext);
  if (theme == null) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }
  return theme;
}

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const { activeLanguage, isRtl } = useLocalization();
  const language = activeLanguage.key;

  // Every language's faces load once at startup. Loading only the active set
  // would flip `loaded` back to false on a language switch, unmounting and
  // remounting the whole tree mid-switch.
  const [fontsLoaded] = useFonts(FontFiles);

  const value = useMemo<AppTheme>(() => {
    const fonts = AppFonts[language] ?? AppFonts.en;
    return {
      loaded: fontsLoaded,
      dark: false,
      isRtl,
      fonts,
      colors: LightColors,
      typography: AppTypographyBuilder(fonts, isRtl),
    };
  }, [language, isRtl, fontsLoaded]);

  return (
    <AppThemeContext.Provider value={value}>
      {/* `direction` mirrors the whole tree for Arabic without touching a screen. */}
      <View
        style={{
          flex: 1,
          direction: isRtl ? "rtl" : "ltr",
          backgroundColor: LightColors.background.white,
        }}
      >
        {fontsLoaded && children}
      </View>
    </AppThemeContext.Provider>
  );
};
