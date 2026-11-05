import "@/features/CoreBootstrap";

import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { queryClient } from "@/common/data-access/api/queryClient";
import { setupQueryManagers } from "@/common/data-access/api/setupQueryManagers";
import { usePurgeStaleDefaultQueryScopes } from "@/common/business-logic/hooks/usePurgeStaleDefaultQueryScopes";
import { AppStack } from "@/common/presentation/components/AppStack";
import { AppToast } from "@/common/presentation/components/AppToast";
import { AppErrorBoundary } from "@/features/core/error-pages/presentation/AppErrorBoundary";
import { EnvironmentProvider } from "@/features/core/environment/presentation/EnvironmentProvider";
import { LocalizationProvider } from "@/common/presentation/providers/LocalizationProvider";
import { AppThemeProvider } from "@/common/presentation/providers/AppThemeProvider";
import { DialogManagerProvider } from "@/features/core/dialogs/presentation/DialogManagerProvider";
import { AppBootProvider } from "@/features/core/app-boot/presentation/AppBootProvider";
import { AlertProvider } from "@/features/core/alerts/presentation/AlertProvider";
import { FirstRunHost } from "@/features/core/first-run/presentation/FirstRunHost";
import { useFeatureFlag } from "@/features/core/feature-flags/business-logic/useFeatureFlag";
import { useOrientationPolicy } from "@/common/business-logic/hooks/useOrientationPolicy";

setupQueryManagers();

/** Keeps React Query cache scoped to language/env; must sit under QueryClientProvider. */
const QueryLifecycle = () => {
  usePurgeStaleDefaultQueryScopes();
  return null;
};

const RootNavigator = () => {
  const detailEnabled = useFeatureFlag("EXAMPLE_DETAIL");

  return (
    <AppStack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Protected guard={detailEnabled}>
        <Stack.Screen
          name="example/[id]"
          options={{ headerShown: false, title: "Post" }}
        />
      </Stack.Protected>
      <Stack.Screen name="+not-found" />
    </AppStack>
  );
};

const RootLayout = () => {
  useOrientationPolicy();

  return (
    <AppErrorBoundary useCrashFallback>
      <EnvironmentProvider>
        <LocalizationProvider>
          <AppThemeProvider>
            <QueryClientProvider client={queryClient}>
              <QueryLifecycle />
              <GestureHandlerRootView style={styles.flex}>
                <BottomSheetModalProvider>
                  <DialogManagerProvider>
                    <AlertProvider>
                      <AppBootProvider>
                        <RootNavigator />
                        <AppToast />
                        <FirstRunHost />
                      </AppBootProvider>
                    </AlertProvider>
                  </DialogManagerProvider>
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </AppThemeProvider>
        </LocalizationProvider>
      </EnvironmentProvider>
    </AppErrorBoundary>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

export default RootLayout;
