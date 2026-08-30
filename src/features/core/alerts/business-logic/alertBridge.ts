import { apiErrorChannel } from "@/common/data-access/api/apiErrorChannel";
import { resolveErrorMessage } from "@/common/data-access/api/apiClient";
import { alertChannel } from "@/features/core/alerts/data-access/alertChannel";
import { AlertSeverityEnums } from "@/features/core/alerts/data-access/alertTypes";

/**
 * Turns API failures into toasts — the one place that decides which failures a
 * user should see.
 *
 * 401 is handled by the session slice (sign out and route to login); a toast on
 * top of that is noise. 422 belongs inline next to the offending field, not in
 * a toast that disappears before the user finds the field.
 */
const SILENT_STATUSES = [401, 422];

let subscribed = false;

export const startAlertBridge = () => {
  if (subscribed) return;
  subscribed = true;

  apiErrorChannel.subscribe((error) => {
    const status = error.response?.status;
    if (status && SILENT_STATUSES.includes(status)) return;

    const message = resolveErrorMessage(error);
    // A backend message is already localized by the `language` header; a
    // failure with neither message nor server response is worth surfacing too.
    if (!message && status && status < 500) return;

    alertChannel.publish({
      severity: AlertSeverityEnums.ERROR,
      message: message ?? "Something went wrong.",
    });
  });
};
