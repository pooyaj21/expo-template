import { ReactNode, useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useAppStore } from "@/common/business-logic/store/app-state";
import { reportError } from "@/common/business-logic/observability/errorReporter";
import { getRegisteredBootSteps } from "@/features/core/app-boot/business-logic/bootRegistry";
import { AppSplash } from "@/features/core/app-boot/presentation/AppSplash";
import { useEnvironment } from "@/features/core/environment/business-logic/useEnvironment";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { DebugMenuHost } from "@/features/core/debug/presentation/DebugMenuHost";

// Keep native splash up until local providers hydrate.
void SplashScreen.preventAutoHideAsync().catch(() => {
  // Already prevented / not available in some environments.
});

const SPLASH_TIMEOUT_MS = 8000;

type AppBootProviderProps = {
  children: ReactNode;
};

export const AppBootProvider = ({ children }: AppBootProviderProps) => {
  const { loaded: envLoaded, selectedEnvironment } = useEnvironment();
  const { loaded: languageLoaded } = useLocalization();
  const { loaded: themeLoaded } = useAppTheme();

  const [storeHydrated, setStoreHydrated] = useState(() =>
    useAppStore.persist.hasHydrated(),
  );
  const [bootStepsDone, setBootStepsDone] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [animationDone, setAnimationDone] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [bootEnvId, setBootEnvId] = useState(selectedEnvironment.id);
  const [stepEpoch, setStepEpoch] = useState(0);

  useEffect(() => {
    setStoreHydrated(useAppStore.persist.hasHydrated());
    return useAppStore.persist.onFinishHydration(() => setStoreHydrated(true));
  }, []);

  const dependenciesLoaded =
    envLoaded && languageLoaded && themeLoaded && storeHydrated;

  if (selectedEnvironment.id !== bootEnvId) {
    setBootEnvId(selectedEnvironment.id);
    setBootError(null);
    setBootStepsDone(false);
    setStepEpoch((value) => value + 1);
  }

  useEffect(() => {
    if (!dependenciesLoaded) return;
    void SplashScreen.hideAsync().catch(() => undefined);
  }, [dependenciesLoaded]);

  useEffect(() => {
    if (!dependenciesLoaded || animationDone) return;
    const timeout = setTimeout(() => setAnimationDone(true), SPLASH_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [dependenciesLoaded, animationDone]);

  const runSteps = useCallback(async () => {
    const registered = getRegisteredBootSteps();
    for (const step of registered) {
      try {
        await step.run();
      } catch (error) {
        reportError(error, { bootStep: step.id, soft: step.soft !== false });
        if (step.soft === false) {
          setBootError(step.id);
          return;
        }
      }
    }
    setBootError(null);
    setBootStepsDone(true);
  }, []);

  useEffect(() => {
    if (!dependenciesLoaded) return;
    let cancelled = false;

    const start = async () => {
      setBootStepsDone(false);
      setBootError(null);
      await runSteps();
      if (cancelled) return;
    };

    void start();
    return () => {
      cancelled = true;
    };
  }, [dependenciesLoaded, stepEpoch, runSteps]);

  useEffect(() => {
    if (bootStepsDone || bootError) setRetrying(false);
  }, [bootStepsDone, bootError]);

  const onRetry = () => {
    setRetrying(true);
    setBootError(null);
    setBootStepsDone(false);
    setStepEpoch((value) => value + 1);
  };

  const isBooting = !bootStepsDone || !animationDone;
  const showError = animationDone && (bootError != null || retrying);

  if (!dependenciesLoaded) return null;

  return (
    <DebugMenuHost isBooting={isBooting}>
      {isBooting ? (
        <AppSplash
          onAnimationFinish={() => setAnimationDone(true)}
          hasError={showError}
          isRetrying={retrying}
          onRetry={onRetry}
        />
      ) : (
        children
      )}
    </DebugMenuHost>
  );
};

export { registerBootStep } from "@/features/core/app-boot/business-logic/bootRegistry";
