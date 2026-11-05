import { ComponentProps } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import ScreenFreeze from "@/common/presentation/components/ScreenFreeze";

type AppStackProps = ComponentProps<typeof Stack>;
type ScreenOptions = NonNullable<AppStackProps["screenOptions"]>;

export const AppStack = ({ screenOptions, ...props }: AppStackProps) => {
  const { getDirection } = useLocalization();
  const isRtl = getDirection() === "rtl";
  const stackAnimation =
    Platform.OS === "android"
      ? isRtl
        ? "ios_from_left"
        : "ios_from_right"
      : isRtl
        ? "slide_from_left"
        : "slide_from_right";

  const baseOptions = {
    headerShown: false,
    animation: stackAnimation,
    animationMatchesGesture: true,
    fullScreenGestureEnabled: true,
    freezeOnBlur: false,
  } as const;

  const mergedOptions: ScreenOptions =
    typeof screenOptions === "function"
      ? (args: Parameters<typeof screenOptions>[0]) => ({
          ...baseOptions,
          ...screenOptions(args),
        })
      : { ...baseOptions, ...screenOptions };

  return (
    <Stack
      screenOptions={mergedOptions}
      screenLayout={({ route, children }) => (
        <ScreenFreeze routeKey={route.key}>{children}</ScreenFreeze>
      )}
      {...props}
    />
  );
};
