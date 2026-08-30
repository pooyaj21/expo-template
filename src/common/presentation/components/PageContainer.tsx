import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { StatusBar, StatusBarStyle } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";

type PageContainerProps = {
  children: ReactNode;
  /** Which safe-area edges to pad. A screen with its own header wants "bottom". */
  safeEdges?: "top" | "bottom" | "both" | "none";
  statusBarStyle?: StatusBarStyle;
  background?: string;
  style?: StyleProp<ViewStyle>;
};

/** The root of every screen: safe-area insets, background, status bar. */
export const PageContainer = ({
  children,
  safeEdges = "both",
  statusBarStyle = "dark",
  background,
  style,
}: PageContainerProps) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const paddingTop =
    safeEdges === "top" || safeEdges === "both" ? insets.top : 0;
  const paddingBottom =
    safeEdges === "bottom" || safeEdges === "both" ? insets.bottom : 0;

  return (
    <View
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
      {children}
    </View>
  );
};
