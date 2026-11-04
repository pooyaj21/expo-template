import * as Haptics from "expo-haptics";
import { isAndroid } from "@/common/data-access/platform";

let isEnabled = true;

export const setHapticsEnabled = (value: boolean) => {
  isEnabled = value;
};

// Devices without a haptic engine reject these. That is normal — swallow so a
// tap never surfaces an unhandled rejection.
const run = (effect: () => Promise<void>) => {
  if (!isEnabled) return;
  effect().catch(() => {});
};

const iosSelection = () => run(Haptics.selectionAsync);

const iosImpact = (style: Haptics.ImpactFeedbackStyle) =>
  run(() => Haptics.impactAsync(style));

const iosNotification = (type: Haptics.NotificationFeedbackType) =>
  run(() => Haptics.notificationAsync(type));

const androidSelection = () => run(Haptics.selectionAsync);

const androidImpact = (style: Haptics.ImpactFeedbackStyle) =>
  run(() => Haptics.impactAsync(style));

export const haptics = {
  selection: () => (isAndroid ? androidSelection() : iosSelection()),

  light: () =>
    isAndroid
      ? androidImpact(Haptics.ImpactFeedbackStyle.Light)
      : iosImpact(Haptics.ImpactFeedbackStyle.Light),

  medium: () =>
    isAndroid
      ? androidImpact(Haptics.ImpactFeedbackStyle.Medium)
      : iosImpact(Haptics.ImpactFeedbackStyle.Medium),

  toggleOn: () =>
    isAndroid
      ? androidImpact(Haptics.ImpactFeedbackStyle.Light)
      : iosImpact(Haptics.ImpactFeedbackStyle.Light),

  toggleOff: () =>
    isAndroid
      ? androidImpact(Haptics.ImpactFeedbackStyle.Light)
      : iosImpact(Haptics.ImpactFeedbackStyle.Light),

  success: () =>
    isAndroid
      ? androidImpact(Haptics.ImpactFeedbackStyle.Medium)
      : iosNotification(Haptics.NotificationFeedbackType.Success),

  warning: () =>
    isAndroid
      ? androidImpact(Haptics.ImpactFeedbackStyle.Light)
      : iosNotification(Haptics.NotificationFeedbackType.Warning),

  error: () =>
    isAndroid
      ? androidImpact(Haptics.ImpactFeedbackStyle.Heavy)
      : iosNotification(Haptics.NotificationFeedbackType.Error),
};
