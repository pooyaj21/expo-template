import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { StatusBar, StatusBarStyle } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { PageBlurProvider } from "@/common/presentation/providers/PageBlurContext";

type PageContainerProps = {
  children: ReactNode;
  /** Which safe-area edges to pad. A screen with its own header wants "bottom". */
  safeEdges?: "top" | "bottom" | "both" | "none";
  statusBarStyle?: StatusBarStyle;
  background?: string;
  /** Mount `PageBlurProvider` so `AppToolbarBlur` can portal above scrolling content. */
  blurToolbar?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** The root of every screen: safe-area insets, background, status bar. */
export const PageContainer = ({
  children,
  safeEdges = "both",
  statusBarStyle = "dark",
  background,
  blurToolbar = false,
  style,
  testID,
}: PageContainerProps) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const paddingTop =
    safeEdges === "top" || safeEdges === "both" ? insets.top : 0;
  const paddingBottom =
    safeEdges === "bottom" || safeEdges === "both" ? insets.bottom : 0;

  return (
    <View
      testID={testID}
      style={[
        {
          flex: 1,
          paddingTop,
          paddingBottom,
          backgroundColor: background ?? colors.background.white,
        },
        style,
      ]}
    >
      <StatusBar style={statusBarStyle} />
      {blurToolbar ? <PageBlurProvider>{children}</PageBlurProvider> : children}
    </View>
  );
};
