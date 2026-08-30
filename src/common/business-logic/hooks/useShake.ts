import { useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";

type ShakeOptions = {
  /** Higher = a harder shake is needed. Roughly in g. */
  threshold?: number;
  intervalMs?: number;
  cooldownMs?: number;
};

/**
 * Shake to open the debug menu — the standard way QA reaches build settings on
 * a device with no dev menu.
 */
export const useShake = (onShake: () => void, options: ShakeOptions = {}) => {
  const { threshold = 3, intervalMs = 100, cooldownMs = 2500 } = options;
  const lastShakeAt = useRef(0);
  const handlerRef = useRef(onShake);
  // The ref is written in an effect, not during render: React may render a
  // component more than once before committing, and a render-phase write is
  // not guaranteed to survive.
  useEffect(() => {
    handlerRef.current = onShake;
  });

  useEffect(() => {
    Accelerometer.setUpdateInterval(intervalMs);

    const subscription = Accelerometer.addListener(
      ({ x = 0, y = 0, z = 0 }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();
        if (magnitude > threshold && now - lastShakeAt.current > cooldownMs) {
          lastShakeAt.current = now;
          handlerRef.current();
        }
      },
    );

    return () => subscription.remove();
  }, [threshold, intervalMs, cooldownMs]);
};
