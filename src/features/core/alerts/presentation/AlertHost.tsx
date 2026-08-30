import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast, {
  ToastConfig,
  ToastConfigParams,
} from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/common/presentation/providers/ThemeProvider";
import { radius, spacing } from "@/common/presentation/theme/AppSpacing";
import { alertChannel } from "@/features/core/alerts/data-access/alertChannel";
import { AlertSeverityEnums } from "@/features/core/alerts/data-access/alertTypes";
import {
  ALERT_VISUALS,
  DEFAULT_ALERT_DURATION_MS,
} from "@/features/core/alerts/presentation/alertTokens";

type AlertToastProps = {
  severity: AlertSeverityEnums;
  message: string;
  title?: string;
};

const AlertToast = ({ severity, message, title }: AlertToastProps) => {
  const { typography } = useAppTheme();
  const visual =
    ALERT_VISUALS[severity] ?? ALERT_VISUALS[AlertSeverityEnums.INFO];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: visual.background, borderColor: visual.border },
      ]}
    >
      <Ionicons name={visual.icon} size={22} color={visual.border} />
      <View style={{ flex: 1 }}>
        {title != null && (
          <Text style={[typography.semiBold[14], { color: visual.text }]}>
            {title}
          </Text>
        )}
        <Text style={[typography.regular[13], { color: visual.text }]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

/**
 * The payload travels in `type` / `text1` / `text2` rather than the library's
 * `props` bag, because `props` defaults to `{}` and the toast component is
 * rendered once on mount — before any toast exists — which made reading
 * `props.alert` a crash on the first frame.
 *
 * `text2` carries the message when there is a title, so its presence is what
 * tells the two layouts apart.
 */
const renderAlert = ({ type, text1, text2 }: ToastConfigParams<unknown>) => {
  const hasTitle = Boolean(text2);
  const message = hasTitle ? text2 : text1;

  // Nothing has been shown yet (or the toast was cleared) — draw nothing.
  if (!message) return null;

  return (
    <AlertToast
      severity={type as AlertSeverityEnums}
      title={hasTitle ? text1 : undefined}
      message={message}
    />
  );
};

const toastConfig: ToastConfig = {
  [AlertSeverityEnums.SUCCESS]: renderAlert,
  [AlertSeverityEnums.ERROR]: renderAlert,
  [AlertSeverityEnums.WARNING]: renderAlert,
  [AlertSeverityEnums.INFO]: renderAlert,
};

/**
 * The single surface that renders alerts. Mount once, at the root, above the
 * navigator so a toast survives a screen transition.
 */
export const AlertHost = () => {
  useEffect(
    () =>
      alertChannel.subscribe((alert) => {
        Toast.show({
          type: alert.severity,
          text1: alert.title ?? alert.message,
          text2: alert.title ? alert.message : undefined,
          visibilityTime: alert.durationMs ?? DEFAULT_ALERT_DURATION_MS,
        });
      }),
    [],
  );

  return <Toast config={toastConfig} topOffset={60} />;
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
});
