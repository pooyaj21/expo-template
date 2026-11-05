import React from "react";
import {
  ColorValue,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Toaster, toast } from "sonner-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSafeAreaInsets } from "@/common/business-logic/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";

const TOAST_TOP_GAP = 8;
const DEFAULT_TOP_OFFSET = 40;
const TOAST_WIDTH_RATIO = 0.9;
const VISIBLE_TOASTS = 3;
const STACK_GAP = 8;
const DEFAULT_TOAST_DURATION = 4000;

export enum ToastTypeEnums {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

type ToastTheme = {
  background: ColorValue;
  border: ColorValue;
  text: ColorValue;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: ColorValue;
};

const TOAST_THEME: Record<ToastTypeEnums, ToastTheme> = {
  [ToastTypeEnums.SUCCESS]: {
    background: "#EDF7ED",
    border: "#24A771",
    text: "#1D865A",
    icon: "checkmark-circle-outline",
    iconColor: "#24A771",
  },
  [ToastTypeEnums.ERROR]: {
    background: "#FDEDED",
    border: "#C03537",
    text: "#5F2120",
    icon: "warning-outline",
    iconColor: "#C03537",
  },
  [ToastTypeEnums.WARNING]: {
    background: "#FFF4E5",
    border: "#F85E00",
    text: "#953800",
    icon: "information-circle-outline",
    iconColor: "#F85E00",
  },
  [ToastTypeEnums.INFO]: {
    background: "#E5F6FD",
    border: "#0FA3B1",
    text: "#09626A",
    icon: "information-circle-outline",
    iconColor: "#0FA3B1",
  },
};

const toToastType = (
  type?: ToastTypeEnums | "success" | "error" | "warning" | "info" | null,
): ToastTypeEnums => {
  switch (type) {
    case ToastTypeEnums.ERROR:
    case "error":
      return ToastTypeEnums.ERROR;
    case ToastTypeEnums.WARNING:
    case "warning":
      return ToastTypeEnums.WARNING;
    case ToastTypeEnums.INFO:
    case "info":
      return ToastTypeEnums.INFO;
    default:
      return ToastTypeEnums.SUCCESS;
  }
};

const AppToastView = ({
  type,
  message,
}: {
  type: ToastTypeEnums;
  message: string;
}) => {
  const { width } = useWindowDimensions();
  const { typography } = useAppTheme();
  const theme = TOAST_THEME[type];

  return (
    <View
      style={[
        styles.container,
        {
          width: width * TOAST_WIDTH_RATIO,
          backgroundColor: theme.background,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <Ionicons name={theme.icon} size={22} color={theme.iconColor} />
        <Text style={{ ...typography.regular[12], flex: 1, color: theme.text }}>
          {message}
        </Text>
      </View>
    </View>
  );
};

let toastQueue: (string | number)[] = [];
let frontDismissTimer: ReturnType<typeof setTimeout> | undefined;

const scheduleFrontDismiss = (durationMs: number) => {
  if (frontDismissTimer) {
    clearTimeout(frontDismissTimer);
    frontDismissTimer = undefined;
  }
  const front = toastQueue[toastQueue.length - 1];
  if (front === undefined) return;
  if (!Number.isFinite(durationMs) || durationMs <= 0) return;

  frontDismissTimer = setTimeout(() => {
    frontDismissTimer = undefined;
    toastQueue = toastQueue.filter((queued) => queued !== front);
    toast.dismiss(front);
    scheduleFrontDismiss(DEFAULT_TOAST_DURATION);
  }, durationMs);
};

const releaseToast = (id: string | number) => {
  if (!toastQueue.includes(id)) return;
  toastQueue = toastQueue.filter((queued) => queued !== id);
  scheduleFrontDismiss(DEFAULT_TOAST_DURATION);
};

export type ShowAppToastInput = {
  type?: ToastTypeEnums | "success" | "error" | "warning" | "info" | null;
  message: string;
  /** Auto-dismiss ms; `null` pins until dismissed. Defaults to 4s. */
  duration?: number | null;
  /** Stable id so the alerts queue can correlate dismissals. */
  toastId?: string;
  onDismiss?: () => void;
};

/**
 * Imperative toast presenter used by the alerts core slice.
 * Prefer `useAlerts().show(...)` from feature code — this is the sonner sink.
 */
export const showAppToast = ({
  type,
  message,
  duration = DEFAULT_TOAST_DURATION,
  toastId,
  onDismiss,
}: ShowAppToastInput) => {
  if (!message.trim()) return;

  const id = toast.custom(
    <AppToastView type={toToastType(type)} message={message} />,
    {
      id: toastId,
      duration: Infinity,
      onDismiss: (dismissedId) => {
        releaseToast(dismissedId);
        onDismiss?.();
      },
    },
  );

  toastQueue = toastQueue.filter((queued) => queued !== id);
  toastQueue.push(id);
  while (toastQueue.length > VISIBLE_TOASTS) {
    const overflowed = toastQueue.shift();
    if (overflowed !== undefined) toast.dismiss(overflowed);
  }

  if (duration === null) {
    if (frontDismissTimer) {
      clearTimeout(frontDismissTimer);
      frontDismissTimer = undefined;
    }
    return id;
  }

  scheduleFrontDismiss(duration ?? DEFAULT_TOAST_DURATION);
  return id;
};

/**
 * Sonner host only. API/meta toasts are owned by `features/core/alerts`
 * (`AlertProvider` → `showAppToast`) so this surface never double-fires.
 */
export const AppToast = () => {
  const insets = useAppSafeAreaInsets();

  return (
    <Toaster
      position="top-center"
      offset={Math.max(insets.top + TOAST_TOP_GAP, DEFAULT_TOP_OFFSET)}
      enableStacking
      visibleToasts={VISIBLE_TOASTS}
      gap={STACK_GAP}
      swipeToDismissDirection="up"
      pauseWhenPageIsHidden
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
});
