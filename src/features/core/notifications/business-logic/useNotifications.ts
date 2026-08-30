import { useCallback, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { AppConfig } from "@/common/data-access/config/AppConfig";
import { notificationsService } from "@/features/core/notifications/data-access/notificationsService";
import { useAppRouter } from "@/common/business-logic/hooks/useAppRouter";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Permission, token and tap handling in one hook. Mounted once by
 * `CoreProviders`; do not call it per screen.
 *
 * A notification payload may carry `{ data: { route: "/example/12" } }` — a tap
 * routes there through the same router every other navigation uses.
 */
export const useNotifications = () => {
  const router = useAppRouter();
  const routerRef = useRef(router);

  // Written in an effect, not during render: React may render more than once
  // before committing, and a render-phase write is not guaranteed to survive.
  useEffect(() => {
    routerRef.current = router;
  });

  const register = useCallback(async () => {
    await notificationsService.configureAndroidChannel();

    const granted = await notificationsService.requestPermission();
    if (!granted) return null;

    const pushToken = await notificationsService.getPushToken();
    if (pushToken) {
      // Deliberately not React state: nothing renders the token, and holding it
      // in state would make registration a setState-from-an-effect.
      await notificationsService.writeStoredToken(pushToken);
      // TODO: POST the token to your backend here, keyed by Device-Id.
    }
    return pushToken;
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const route = response.notification.request.content.data?.route;
        if (typeof route === "string") routerRef.current.push(route);
      },
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // Expo Go cannot receive remote push; skipping keeps the dev log clean.
    if (AppConfig.isExpoGo) return;
    void register();
  }, [register]);

  return { register, readStoredToken: notificationsService.readStoredToken };
};
