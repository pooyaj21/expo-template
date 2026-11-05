import { ComponentProps, useCallback, useRef } from "react";
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, { AnimatedStyle } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = ComponentProps<typeof AnimatedPressable>;

export interface CTouchableProps
  extends Omit<PressableProps, "style">,
    Pick<AnimatedPressableProps, "entering" | "exiting" | "layout"> {
  throttleEnabled?: boolean;
  throttleTime?: number;
  /**
   * Opt into the Reanimated-backed pressable. Only set it when `style` carries a
   * `useAnimatedStyle` result — a recycled list cell pays for the animated node on
   * every rebind, which is what makes FlashList flash blank mid-fling.
   */
  animated?: boolean;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
}

// Guards against an accidental double-fire only. A real double-tap lands well
// under this; anything longer starts eating deliberate repeat taps (the cart
// quantity stepper was capped at two increments per second).
const defaultThrottleTime = 250;
const defaultThrottleEnabled = true;

export const CTouchable = (props: CTouchableProps) => {
  const {
    throttleEnabled,
    throttleTime,
    animated,
    entering,
    exiting,
    layout,
    style,
    onPress,
    children,
    ...rest
  } = props;

  const isThrottleEnabled = throttleEnabled ?? defaultThrottleEnabled;

  const lastPressTime = useRef<number>(0);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (!isThrottleEnabled) {
        onPress?.(event);
        return;
      }

      const now = Date.now();
      const timePassed = now - lastPressTime.current;
      if (timePassed < (throttleTime ?? defaultThrottleTime)) {
        return;
      }
      lastPressTime.current = now;
      onPress?.(event);
    },
    [onPress, throttleTime, isThrottleEnabled],
  );

  const needsAnimated =
    animated === true || entering != null || exiting != null || layout != null;

  if (needsAnimated) {
    return (
      <AnimatedPressable
        {...rest}
        entering={entering}
        exiting={exiting}
        layout={layout}
        style={style}
        onPress={handlePress}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <Pressable
      {...rest}
      style={style as StyleProp<ViewStyle>}
      onPress={handlePress}
    >
      {children}
    </Pressable>
  );
};
