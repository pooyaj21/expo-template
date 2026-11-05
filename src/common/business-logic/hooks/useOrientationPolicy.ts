import { useEffect } from "react";
import { Dimensions, type ScaledSize } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { TABLET_MIN_WIDTH } from "@/common/business-logic/constants/layout";
import { reportError } from "@/common/business-logic/observability/errorReporter";

const isLargeScreen = (screen: ScaledSize) =>
  Math.min(screen.width, screen.height) >= TABLET_MIN_WIDTH;

const applyOrientationPolicy = (screen: ScaledSize) => {
  const request = isLargeScreen(screen)
    ? ScreenOrientation.unlockAsync()
    : ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
  request.catch((error) =>
    reportError(error, { source: "useOrientationPolicy" }),
  );
};

export const useOrientationPolicy = () => {
  useEffect(() => {
    applyOrientationPolicy(Dimensions.get("screen"));
    const subscription = Dimensions.addEventListener("change", ({ screen }) =>
      applyOrientationPolicy(screen),
    );
    return () => subscription.remove();
  }, []);
};
