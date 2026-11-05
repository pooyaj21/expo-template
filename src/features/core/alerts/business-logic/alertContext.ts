import { createContext, useContext } from "react";
import type { AlertShowInput } from "@/features/core/alerts/data-access/alertTypes";

/**
 * Alert contract lives in business-logic so BL hooks can raise alerts without
 * importing presentation. The provider that implements it is presentation.
 */
export interface AlertsApi {
  /** Show an alert. Returns its id, or `null` when deduped away. */
  show: (input: AlertShowInput) => string | null;
  showInfo: (input: Omit<AlertShowInput, "severity">) => string | null;
  showSuccess: (input: Omit<AlertShowInput, "severity">) => string | null;
  showWarning: (input: Omit<AlertShowInput, "severity">) => string | null;
  showError: (input: Omit<AlertShowInput, "severity">) => string | null;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const AlertsContext = createContext<AlertsApi | null>(null);

/**
 * Raise alerts from a component or a business-logic hook.
 *
 * @example
 * ```ts
 * const { show } = useAlerts();
 * show({ severity: 'success', messageKey: 'common.ok' });
 * show({ severity: 'error', message: apiMessage });
 * ```
 */
export const useAlerts = (): AlertsApi => {
  const context = useContext(AlertsContext);

  if (!context) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }

  return context;
};
