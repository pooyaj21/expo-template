import { useEffect } from "react";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { registerApiAlertMessages } from "@/features/core/alerts/data-access/alertBridge";

/**
 * Hands the axios alert bridge its translated fallback copy.
 *
 * The bridge raises alerts from channel subscribers outside React's `t()`, so
 * strings are pushed in from here. Only client-side fallbacks need this —
 * backend messages arrive already localized via the `language` header.
 *
 * Called once from `AlertProvider`.
 */
export const useApiAlertMessages = (): void => {
  const { getString } = useLocalization();

  useEffect(() => {
    registerApiAlertMessages({
      network: getString("alerts.network"),
      server: getString("alerts.server"),
      generic: getString("alerts.generic"),
    });
  }, [getString]);
};
