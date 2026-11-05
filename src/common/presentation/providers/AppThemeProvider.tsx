import React, { useMemo, type ReactNode } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { useFonts } from "expo-font";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
  type Theme,
} from "@react-navigation/native";
import { darkColors, lightColors } from "@/common/presentation/token/colors";
import {
  fontFiles,
  fontMap,
  type AppLanguageCode,
} from "@/common/presentation/token/fonts";
import { buildTypography } from "@/common/presentation/token/typography";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import {
  AppThemeContext,
  type AppThemeApi,
} from "@/common/business-logic/hooks/useAppTheme";

type AppThemeProviderProps = {
  children: ReactNode;
};

type NavigationFonts = {
  regular: { fontFamily: string; fontWeight: "400" };
  medium: { fontFamily: string; fontWeight: "500" };
  bold: { fontFamily: string; fontWeight: "600" };
  heavy: { fontFamily: string; fontWeight: "700" };
};

type ExtendedTheme = Theme & {
  fonts: NavigationFonts;
};

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const { language, isRTL } = useLocalization();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? darkColors : lightColors;
  const baseNavigationTheme = isDark
    ? NavigationDarkTheme
    : NavigationDefaultTheme;

  const fonts = useMemo(() => {
    const lang = language as AppLanguageCode;
    return {
      ...fontMap.en,
      ...(fontMap[lang] ?? fontMap.en),
    };
  }, [language]);

  // Load every language's fonts once at startup so language switches do not
  // flip `loaded` back to false and remount the tree.
  const [fontsLoaded] = useFonts(fontFiles);

  const navigationTheme = useMemo<ExtendedTheme>(
    () => ({
      ...baseNavigationTheme,
      dark: isDark,
      colors: {
        ...baseNavigationTheme.colors,
        primary: colors.primary.main,
        background: colors.background.main,
        card: colors.background.level1,
        text: colors.text.primary,
        border: colors.border.default,
        notification: colors.error.main,
      },
      fonts: {
        regular: { fontFamily: fonts.regular, fontWeight: "400" },
        medium: { fontFamily: fonts.medium, fontWeight: "500" },
        bold: { fontFamily: fonts.semiBold, fontWeight: "600" },
        heavy: { fontFamily: fonts.bold, fontWeight: "700" },
      },
    }),
    [baseNavigationTheme, isDark, colors, fonts],
  );

  const typography = useMemo(
    () => buildTypography(fonts, isRTL),
    [fonts, isRTL],
  );

  const value = useMemo<AppThemeApi>(
    () => ({
      colors,
      typography,
      fonts,
      isDark,
      loaded: fontsLoaded,
    }),
    [colors, typography, fonts, isDark, fontsLoaded],
  );

  const rootStyle = useMemo(
    () => [
      { backgroundColor: colors.background.main },
      StyleSheet.absoluteFillObject,
    ],
    [colors.background.main],
  );

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider value={navigationTheme}>
        {fontsLoaded ? <View style={rootStyle}>{children}</View> : null}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
};
