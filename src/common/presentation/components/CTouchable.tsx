import { useCallback, useRef } from "react";
import { GestureResponderEvent, Pressable, PressableProps } from "react-native";

interface CTouchableProps extends PressableProps {
  throttleEnabled?: boolean;
  throttleTime?: number;
}

const DEFAULT_THROTTLE_MS = 500;

/**
 * Pressable with press throttling. Double-taps on a submit button create
 * duplicate orders; this is the cheapest place to stop that, so every
 * touchable in the app goes through here.
 */
export const CTouchable = ({
  throttleEnabled = true,
  throttleTime = DEFAULT_THROTTLE_MS,
  onPress,
  children,
  ...rest
}: CTouchableProps) => {
  const lastPressTime = useRef(0);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (!throttleEnabled) {
        onPress?.(event);
        return;
      }
      const now = Date.now();
      if (now - lastPressTime.current < throttleTime) return;
      lastPressTime.current = now;
      onPress?.(event);
    },
    [onPress, throttleEnabled, throttleTime],
  );

  return (
    <Pressable {...rest} onPress={handlePress}>
      {children}
    </Pressable>
  );
};
