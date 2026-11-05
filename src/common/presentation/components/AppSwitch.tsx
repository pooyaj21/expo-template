import React, { useEffect } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AppPressable } from "@/common/presentation/components/AppPressable";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { haptics } from "@/common/business-logic/utils/haptics";

type AppSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  isEnabled?: boolean;
  style?: ViewStyle;
  testID?: string;
};

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const THUMB_SIZE = 20;
const PADDING = 3;

export const AppSwitch = ({
  value,
  onValueChange,
  isEnabled = true,
  style,
  testID,
}: AppSwitchProps) => {
  const { colors } = useAppTheme();
  const { getDirection } = useLocalization();
  const progress = useSharedValue(value ? 1 : 0);

  const travel =
    (TRACK_WIDTH - THUMB_SIZE - PADDING * 2) *
    (getDirection() === "rtl" ? -1 : 1);

  const offColor = colors.grey[100];
  const onColor = colors.primary.main;

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 180 });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [offColor, onColor],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [0, travel]),
      },
    ],
  }));

  return (
    <AppPressable
      disabled={!isEnabled}
      testID={testID}
      onPress={() => {
        const next = !value;
        if (next) {
          haptics.toggleOn();
        } else {
          haptics.toggleOff();
        }
        onValueChange(next);
      }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !isEnabled }}
      style={[{ opacity: isEnabled ? 1 : 0.5 }, style]}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View
          style={[
            styles.thumb,
            { backgroundColor: colors.background.white },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </AppPressable>
  );
};

export default AppSwitch;

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: PADDING,
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
});
