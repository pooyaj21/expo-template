import { useEffect, useMemo } from "react";
import { Animated, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { AppPressable } from "@/common/presentation/components/app/AppPressable";

type AppSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  isEnabled?: boolean;
  style?: StyleProp<ViewStyle>;
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
}: AppSwitchProps) => {
  const { colors } = useAppTheme();
  // useMemo, not useRef: the value is read during render to interpolate.
  // Seeded at 0 and driven to `value` by the effect below, so mounting an
  // already-on switch animates once instead of jumping.
  const anim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      // Colour interpolation is not supported on the native driver.
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  return (
    <AppPressable
      disabled={!isEnabled}
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !isEnabled }}
      style={[{ opacity: isEnabled ? 1 : 0.5 }, style]}
    >
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.grey[100], colors.primary.main],
            }),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: colors.background.white,
              transform: [
                {
                  translateX: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, TRACK_WIDTH - THUMB_SIZE - PADDING * 2],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </AppPressable>
  );
};

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
