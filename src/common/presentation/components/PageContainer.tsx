import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { StatusBar, type StatusBarStyle } from "expo-status-bar";
import { useAppSafeAreaInsets } from "@/common/business-logic/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { PageBlurProvider } from "@/common/presentation/providers/PageBlurProvider";

export type PageContainerProps = {
  children: ReactNode;
  caringSides?: "top" | "bottom" | "both" | "none";
  statusBarStyle?: StatusBarStyle;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /**
   * Opt into the toolbar blur portal. Mount only on screens that render
   * `AppToolbarBlur` and let content scroll under the frosted bar.
   */
  blurToolbar?: boolean;
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

  const content = props.blurToolbar ? (
    <PageBlurProvider>{props.children}</PageBlurProvider>
  ) : (
    props.children
  );

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
      {content}
    </View>
  );
};
