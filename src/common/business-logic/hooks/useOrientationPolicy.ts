import { useEffect } from "react";
import { Dimensions, ScaledSize } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { captureException } from "@/common/data-access/monitoring/sentry";
import { TABLET_MIN_WIDTH } from "@/common/business-logic/hooks/useDimensions";

const isLargeScreen = (screen: ScaledSize) =>
  Math.min(screen.width, screen.height) >= TABLET_MIN_WIDTH;

const applyOrientationPolicy = (screen: ScaledSize) => {
  const request = isLargeScreen(screen)
    ? ScreenOrientation.unlockAsync()
    : ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
  request.catch((error) => captureException(error));
};

/** Phones stay portrait; tablets / large windows unlock rotation. */
export const useOrientationPolicy = () => {
  useEffect(() => {
    applyOrientationPolicy(Dimensions.get("screen"));
    const subscription = Dimensions.addEventListener("change", ({ screen }) =>
      applyOrientationPolicy(screen),
    );
    return () => subscription.remove();
  }, []);
};
