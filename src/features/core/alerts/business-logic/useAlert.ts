import { useMemo } from "react";
import { alertChannel } from "@/features/core/alerts/data-access/alertChannel";
import {
  AlertPayload,
  AlertSeverityEnums,
} from "@/features/core/alerts/data-access/alertTypes";

type AlertInput = Omit<AlertPayload, "severity">;

/** Raise an alert from outside React (interceptors, plain modules, stores). */
export const showAlert = (alert: AlertPayload) => alertChannel.publish(alert);

/**
 * Whoever knows the outcome raises the alert: a mutation's `onSuccess` lives in
 * business-logic, so business-logic alerts; a pure UI event alerts from
 * presentation.
 */
export const useAlert = () =>
  useMemo(
    () => ({
      showSuccess: (input: AlertInput) =>
        showAlert({ ...input, severity: AlertSeverityEnums.SUCCESS }),
      showError: (input: AlertInput) =>
        showAlert({ ...input, severity: AlertSeverityEnums.ERROR }),
      showWarning: (input: AlertInput) =>
        showAlert({ ...input, severity: AlertSeverityEnums.WARNING }),
      showInfo: (input: AlertInput) =>
        showAlert({ ...input, severity: AlertSeverityEnums.INFO }),
    }),
    [],
  );
