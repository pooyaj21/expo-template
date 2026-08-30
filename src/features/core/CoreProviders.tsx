import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createQueryClient } from "@/common/data-access/api/queryClient";
import { QueryScopeProvider } from "@/common/data-access/api/queryScope";
import { AppThemeProvider } from "@/common/presentation/providers/ThemeProvider";
import {
  EnvironmentProvider,
  useEnvironment,
} from "@/features/core/environment/business-logic/environmentContext";
import {
  LocalizationProvider,
  useLocalization,
} from "@/common/business-logic/localization/localizationContext";
import { ApiClientProvider } from "@/features/core/api/data-access/apiClientContext";
import { DialogManagerProvider } from "@/features/core/dialogs/presentation/DialogManagerProvider";
import { useSessionStoreToken } from "@/features/core/session/business-logic/store/sessionSelectors";
import { AlertHost } from "@/features/core/alerts/presentation/AlertHost";
import { AppBootstrap } from "@/features/core/AppBootstrap";
import "@/features/core/CoreBootstrap";

const queryClient = createQueryClient();

/**
 * The composition root. Order matters and is not arbitrary:
 * environment → localization → theme (typesets per script) → query client →
 * query scope (needs env, language, session) → api client → dialogs →
 * bootstrap (device, session, deep links, push).
 */
export const CoreProviders = ({ children }: { children: ReactNode }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <EnvironmentProvider>
        <LocalizationProvider>
          <AppThemeProvider>
            <QueryClientProvider client={queryClient}>
              <ScopedCore>
                <ApiClientCore>
                  <BottomSheetModalProvider>
                    <DialogManagerProvider>
                      <AppBootstrap>{children}</AppBootstrap>
                      <AlertHost />
                    </DialogManagerProvider>
                  </BottomSheetModalProvider>
                </ApiClientCore>
              </ScopedCore>
            </QueryClientProvider>
          </AppThemeProvider>
        </LocalizationProvider>
      </EnvironmentProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

/** Feeds the client's base-URL slot from the environment slice. */
const ApiClientCore = ({ children }: { children: ReactNode }) => {
  const { baseUrl } = useEnvironment();
  return <ApiClientProvider baseUrl={baseUrl}>{children}</ApiClientProvider>;
};

/** Feeds the kernel's cache-scope slot from the slices that define identity. */
const ScopedCore = ({ children }: { children: ReactNode }) => {
  const { selectedEnvironment } = useEnvironment();
  const { activeLanguage } = useLocalization();
  const token = useSessionStoreToken();

  return (
    <QueryScopeProvider
      scope={[selectedEnvironment.id, activeLanguage.key, token ?? "guest"]}
    >
      {children}
    </QueryScopeProvider>
  );
};
