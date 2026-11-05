import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { StatusBarStyle } from "expo-status-bar";
import { useAppSafeAreaInsets } from "@/common/business-logic/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";

export type PageContainerProps = {
  children: ReactNode;
  caringSides?: "top" | "bottom" | "both" | "none";
  statusBarStyle?: StatusBarStyle;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const PageContainer = (props: PageContainerProps) => {
  const { colors, isDark } = useAppTheme();
  const insets = useAppSafeAreaInsets();
  const caringSides = props.caringSides ?? "both";

  let paddingTop = 0;
  let paddingBottom = 0;
  if (caringSides !== "none") {
    if (caringSides !== "bottom") paddingTop = insets.top;
    if (caringSides !== "top") paddingBottom = insets.bottom;
  }

  return (
    <View
      testID={props.testID}
      style={[
        {
          paddingTop,
          paddingBottom,
          height: "100%",
          backgroundColor: colors.background.white,
        },
        props.style,
      ]}
    >
      <StatusBar style={props.statusBarStyle ?? (isDark ? "light" : "dark")} />
      {props.children}
    </View>
  );
};
