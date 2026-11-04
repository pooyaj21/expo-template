import { ReactNode, useCallback, useEffect, useState } from "react";
import { SplashScreen, usePathname } from "expo-router";
import { PageContainer } from "@/common/presentation/components/PageContainer";
import { Loading } from "@/common/presentation/components/Loading";
import { ErrorView } from "@/common/presentation/components/ErrorView";
import { useLocalization } from "@/common/business-logic/localization/localizationContext";
import { useAppRouter } from "@/common/business-logic/hooks/useAppRouter";
import { routes } from "@/common/business-logic/routes/paths";
import { useShake } from "@/common/business-logic/hooks/useShake";
import { AppConfig } from "@/common/data-access/config/AppConfig";
import { useDevice } from "@/features/core/device/business-logic/useDevice";
import { useSessionBootstrap } from "@/features/core/session/business-logic/useSessionBootstrap";
import { useDeepLinks } from "@/features/core/deep-links/business-logic/useDeepLinks";
import { useNotifications } from "@/features/core/notifications/business-logic/useNotifications";
import { useScreenTracking } from "@/features/core/analytics/business-logic/useAnalytics";
import { useEnvironment } from "@/features/core/environment/business-logic/environmentContext";
import { useGetAppSettings } from "@/features/core/app-settings/business-logic/useGetAppSettings";
import { useOrientationPolicy } from "@/common/business-logic/hooks/useOrientationPolicy";

type BootstrapStep = "device" | "session";

/**
 * Everything that must be true before the first screen renders, and the one
 * place that decides when the splash comes down.
 *
 * Steps latch: once the app is up, a later failure surfaces as a toast, never
 * as a full-screen error that tears down a working session.
 */
export const AppBootstrap = ({ children }: { children: ReactNode }) => {
  const { getString } = useLocalization();
  const router = useAppRouter();
  const pathname = usePathname();

  const { loaded: environmentReady } = useEnvironment();
  const { loaded: localizationReady } = useLocalization();
  const { hasHydrated: deviceReady, hydrate: hydrateDevice } = useDevice();
  const { isHydrated: sessionReady } = useSessionBootstrap();

  const [error, setError] = useState<BootstrapStep | null>(null);
  const [retrying, setRetrying] = useState(false);

  useDeepLinks();
  useNotifications();
  useScreenTracking();
  useOrientationPolicy();
  // Unauthenticated; failure must not block splash. Mirrors into settings +
  // feature-flag stores when the response arrives.
  useGetAppSettings();

  useEffect(() => {
    if (deviceReady) return;
    hydrateDevice().catch(() => setError("device"));
  }, [deviceReady, hydrateDevice]);

  const isReady =
    environmentReady && localizationReady && deviceReady && sessionReady;

  // The splash is this component's to hide, because it is the only one that
  // knows about every outcome — ready, retrying, and failed. Hiding it from the
  // ready path alone would leave a failed boot stuck behind the splash forever.
  useEffect(() => {
    if (isReady || error) void SplashScreen.hideAsync();
  }, [isReady, error]);

  // Shake to open the debug menu — the standard way QA reaches build settings.
  useShake(
    useCallback(() => {
      if (!AppConfig.isDevelop) return;
      if (pathname?.startsWith("/debug")) return;
      router.push(routes.debug());
    }, [pathname, router]),
  );

  const retry = () => {
    setError(null);
    setRetrying(true);
    hydrateDevice()
      .catch(() => setError("device"))
      .finally(() => setRetrying(false));
  };

  if (error) {
    return (
      <PageContainer>
        <ErrorView title={getString("bootstrap_error_title")} onRetry={retry} />
      </PageContainer>
    );
  }

  if (retrying && !isReady) {
    return (
      <PageContainer>
        <Loading />
      </PageContainer>
    );
  }

  // The splash is still up at this point — render nothing rather than a flash
  // of an empty screen.
  if (!isReady) return null;

  return <>{children}</>;
};
