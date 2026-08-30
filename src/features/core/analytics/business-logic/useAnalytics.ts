import { useCallback, useEffect, useMemo } from "react";
import { usePathname } from "expo-router";
import { analyticsRegistry } from "@/features/core/analytics/data-access/analyticsRegistry";
import {
  AnalyticsEventName,
  AnalyticsEvents,
} from "@/features/core/analytics/data-access/analyticsEvents";
import { AnalyticsParams } from "@/features/core/analytics/data-access/analyticsTypes";
import { useLocalization } from "@/common/business-logic/localization/localizationContext";
import { useSessionStoreUser } from "@/features/core/session/business-logic/store/sessionSelectors";

/** Track from anywhere, including outside React. */
export const track = (
  event: AnalyticsEventName | (string & {}),
  params?: AnalyticsParams,
) => analyticsRegistry.track(event, params);

export const useAnalytics = () => {
  const user = useSessionStoreUser();
  const { activeLanguage } = useLocalization();

  const identify = useCallback(() => {
    analyticsRegistry.identify({
      userId: user?.id?.toString(),
      email: user?.email,
      language: activeLanguage.key,
    });
  }, [user, activeLanguage.key]);

  return useMemo(
    () => ({
      track,
      identify,
      screen: (name: string, params?: AnalyticsParams) =>
        analyticsRegistry.screen(name, params),
      reset: () => analyticsRegistry.reset(),
      events: AnalyticsEvents,
    }),
    [identify],
  );
};

/**
 * Fires one `screen_view` per route change. Mounted once in `CoreProviders` —
 * screens do not each remember to report themselves.
 */
export const useScreenTracking = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    analyticsRegistry.screen(pathname);
  }, [pathname]);
};
