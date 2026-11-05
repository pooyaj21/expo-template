import { StyleProp, ViewStyle } from "react-native";
import { BlurView, BlurViewProps } from "expo-blur";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";

type AppBlurViewProps = BlurViewProps & {
  style?: StyleProp<ViewStyle>;
};

export const AppBlurView = ({
  intensity = 40,
  tint,
  style,
  ...rest
}: AppBlurViewProps) => {
  const { isDark } = useAppTheme();
  return (
    <BlurView
      intensity={intensity}
      tint={tint ?? (isDark ? "dark" : "light")}
      style={style}
      {...rest}
    />
  );
};
