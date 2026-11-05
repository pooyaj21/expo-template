import { useCallback, useEffect, useRef, useState } from "react";
import { apiErrorChannel } from "@/common/data-access/api/apiErrorChannel";
import { apiResponseChannel } from "@/common/data-access/api/apiResponseChannel";
import { alertChannel } from "@/features/core/alerts/data-access/alertChannel";
import {
  describeApiError,
  describeApiResponse,
} from "@/features/core/alerts/data-access/alertBridge";
import type {
  AlertErrorMode,
  AlertInput,
  AlertRecord,
} from "@/features/core/alerts/data-access/alertTypes";
import {
  DEDUPE_WINDOW_MS,
  DEFAULT_MAX_VISIBLE,
  DEFAULT_SEVERITY,
} from "@/features/core/alerts/business-logic/alertPolicy";

let alertCounter = 0;
const nextAlertId = (): string => `alert-${(alertCounter += 1)}`;

interface UseAlertQueueOptions {
  /** Filters channel-fed alerts only. Defaults to `selective`. */
  errorMode?: AlertErrorMode;
  maxVisible?: number;
}

/**
 * Alert queue: dedupe, visible cap, and `errorMode` filter for channel-fed
 * failures. No JSX — rendering is `AlertProvider`'s job (via AppToast/sonner).
 */
export const useAlertQueue = ({
  errorMode = "selective",
  maxVisible = DEFAULT_MAX_VISIBLE,
}: UseAlertQueueOptions = {}): {
  alerts: AlertRecord[];
  showAlert: (input: AlertInput) => string | null;
  dismiss: (id: string) => void;
  dismissAll: () => void;
} => {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const shownAtRef = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setAlerts((previous) => previous.filter((alert) => alert.id !== id));
  }, []);

  const dismissAll = useCallback(() => setAlerts([]), []);

  const showAlert = useCallback(
    (input: AlertInput): string | null => {
      const message = input.message.trim();
      if (!message) return null;

      const severity = input.severity ?? DEFAULT_SEVERITY;
      const dedupeKey =
        input.dedupeKey ?? `${severity}:${input.title ?? ""}:${message}`;
      const now = Date.now();

      const lastShownAt = shownAtRef.current.get(dedupeKey);
      if (lastShownAt !== undefined && now - lastShownAt < DEDUPE_WINDOW_MS) {
        return null;
      }

      shownAtRef.current.forEach((at, key) => {
        if (now - at >= DEDUPE_WINDOW_MS) shownAtRef.current.delete(key);
      });
      shownAtRef.current.set(dedupeKey, now);

      const record: AlertRecord = {
        ...input,
        message,
        id: nextAlertId(),
        severity,
        dedupeKey,
        createdAt: now,
      };
      setAlerts((previous) => [...previous, record].slice(-maxVisible));
      return record.id;
    },
    [maxVisible],
  );

  useEffect(() => alertChannel.subscribe(showAlert), [showAlert]);

  useEffect(
    () =>
      apiErrorChannel.subscribe((error) => {
        const descriptor = describeApiError(error);
        if (!descriptor) return;
        if (errorMode === "selective" && !descriptor.userFacing) return;

        showAlert({
          severity: descriptor.severity ?? "error",
          title: descriptor.title,
          message: descriptor.message,
          dedupeKey: descriptor.dedupeKey,
        });
      }),
    [errorMode, showAlert],
  );

  useEffect(
    () =>
      apiResponseChannel.subscribe((response) => {
        const descriptor = describeApiResponse(response);
        if (!descriptor) return;

        showAlert({
          severity: descriptor.severity,
          title: descriptor.title,
          message: descriptor.message,
          dedupeKey: descriptor.dedupeKey,
        });
      }),
    [showAlert],
  );

  return { alerts, showAlert, dismiss, dismissAll };
};
