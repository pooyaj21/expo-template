import { useRef } from "react";

/**
 * The "tap the version number five times" gesture. Returns an `onPress` to hand
 * a touchable; the trigger fires only when the taps land inside `timeout` of
 * each other.
 */
export const useHiddenTap = (
  onTrigger: () => void,
  taps = 5,
  timeout = 500,
) => {
  const tapCount = useRef(0);
  const lastTap = useRef(0);

  return () => {
    const now = Date.now();
    if (now - lastTap.current > timeout) tapCount.current = 0;

    tapCount.current += 1;
    lastTap.current = now;

    if (tapCount.current >= taps) {
      tapCount.current = 0;
      onTrigger();
    }
  };
};
