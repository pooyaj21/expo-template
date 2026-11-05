import { useCallback } from "react";
import { GestureResponderEvent } from "react-native";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  CTouchable,
  CTouchableProps,
} from "@/common/presentation/components/CTouchable";

const PRESSED_SCALE = 0.95;
const PRESS_IN_DURATION = 110;
const PRESS_OUT_SPRING = { damping: 15, stiffness: 260, mass: 0.5 };

interface AppPressableProps extends CTouchableProps {
  enableAnimation?: boolean;
}

const ScalingPressable = (props: CTouchableProps) => {
  const { onPressIn, onPressOut, style, ...rest } = props;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withTiming(PRESSED_SCALE, {
        duration: PRESS_IN_DURATION,
        easing: Easing.out(Easing.quad),
      });
      onPressIn?.(event);
    },
    [onPressIn, scale],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withSpring(1, PRESS_OUT_SPRING);
      onPressOut?.(event);
    },
    [onPressOut, scale],
  );

  return (
    <CTouchable
      {...rest}
      animated
      style={[animatedStyle, ...(Array.isArray(style) ? style : [style])]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    />
  );
};

export const AppPressable = (props: AppPressableProps) => {
  const { enableAnimation, ...rest } = props;

  if (enableAnimation === true && rest.onPress !== undefined) {
    return <ScalingPressable {...rest} />;
  }

  return <CTouchable {...rest} />;
};
