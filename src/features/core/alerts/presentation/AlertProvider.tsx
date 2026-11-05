import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import {
  showAppToast,
  ToastTypeEnums,
} from "@/common/presentation/components/AppToast";
import {
  AlertsApi,
  AlertsContext,
} from "@/features/core/alerts/business-logic/alertContext";
import { DEFAULT_DURATIONS } from "@/features/core/alerts/business-logic/alertPolicy";
import { useAlertQueue } from "@/features/core/alerts/business-logic/useAlertQueue";
import { useApiAlertMessages } from "@/features/core/alerts/business-logic/useApiAlertMessages";
import type {
  AlertRecord,
  AlertSeverity,
  AlertShowInput,
} from "@/features/core/alerts/data-access/alertTypes";

/**
 * How much of what the network layer reports reaches the screen.
 * Set `EXPO_PUBLIC_ALERT_ERROR_MODE=all` in a dev/QA env to surface every
 * failed request instead of only user-facing ones.
 */
export const ALERT_ERROR_MODE =
  process.env.EXPO_PUBLIC_ALERT_ERROR_MODE === "all" ? "all" : "selective";

const toToastType = (severity: AlertSeverity): ToastTypeEnums => {
  switch (severity) {
    case "error":
      return ToastTypeEnums.ERROR;
    case "warning":
      return ToastTypeEnums.WARNING;
    case "info":
      return ToastTypeEnums.INFO;
    default:
      return ToastTypeEnums.SUCCESS;
  }
};

const toastMessage = (alert: AlertRecord): string =>
  alert.title ? `${alert.title}\n${alert.message}` : alert.message;

/**
 * Mounts the alert system: runs the queue, publishes `useAlerts()`, and renders
 * through `AppToast` / sonner-native (no second toast surface).
 *
 * Must sit inside LocalizationProvider. Mount next to `<AppToast />` in the
 * root layout — AppToast owns the Toaster; this provider owns the queue.
 */
export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const { getString } = useLocalization();
  const { alerts, showAlert, dismiss, dismissAll } = useAlertQueue({
    errorMode: ALERT_ERROR_MODE,
  });
  const renderedIdsRef = useRef(new Set<string>());

  useApiAlertMessages();

  useEffect(() => {
    const activeIds = new Set(alerts.map((alert) => alert.id));

    renderedIdsRef.current.forEach((id) => {
      if (!activeIds.has(id)) {
        renderedIdsRef.current.delete(id);
      }
    });

    for (const alert of alerts) {
      if (renderedIdsRef.current.has(alert.id)) continue;
      renderedIdsRef.current.add(alert.id);

      const delay =
        alert.duration === undefined
          ? DEFAULT_DURATIONS[alert.severity]
          : alert.duration;

      showAppToast({
        type: toToastType(alert.severity),
        message: toastMessage(alert),
        duration: delay,
        toastId: alert.id,
        onDismiss: () => dismiss(alert.id),
      });
    }
  }, [alerts, dismiss]);

  const resolveShowInput = useCallback(
    (input: AlertShowInput) => {
      const message =
        input.message ??
        (input.messageKey != null ? getString(input.messageKey) : "");
      const title =
        input.title ??
        (input.titleKey != null ? getString(input.titleKey) : undefined);

      return showAlert({
        severity: input.severity,
        title,
        message,
        action: input.action,
        undo: input.undo,
        duration: input.duration,
        dedupeKey: input.dedupeKey,
      });
    },
    [getString, showAlert],
  );

  const api = useMemo<AlertsApi>(
    () => ({
      show: resolveShowInput,
      showInfo: (input) => resolveShowInput({ ...input, severity: "info" }),
      showSuccess: (input) =>
        resolveShowInput({ ...input, severity: "success" }),
      showWarning: (input) =>
        resolveShowInput({ ...input, severity: "warning" }),
      showError: (input) => resolveShowInput({ ...input, severity: "error" }),
      dismiss,
      dismissAll,
    }),
    [resolveShowInput, dismiss, dismissAll],
  );

  return (
    <AlertsContext.Provider value={api}>{children}</AlertsContext.Provider>
  );
};
