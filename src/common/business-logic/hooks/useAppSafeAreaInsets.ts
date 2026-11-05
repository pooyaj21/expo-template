import { Platform } from "react-native";
import {
  EdgeInsets,
  initialWindowMetrics,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const ANDROID_MIN_BOTTOM_INSET = 34;

export const useAppSafeAreaInsets = (): EdgeInsets => {
  const insets = useSafeAreaInsets();

  if (Platform.OS !== "android") return insets;

  return {
    ...insets,
    bottom: Math.max(
      insets.bottom,
      initialWindowMetrics?.insets.bottom ?? 0,
      ANDROID_MIN_BOTTOM_INSET,
    ),
  };
};
