import "@/features/CoreBootstrap";

import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { queryClient } from "@/common/data-access/api/queryClient";
import { AppStack } from "@/common/presentation/components/AppStack";
import { AppToast } from "@/common/presentation/components/AppToast";
import { AppErrorBoundary } from "@/features/core/error-pages/presentation/AppErrorBoundary";
import { EnvironmentProvider } from "@/features/core/environment/presentation/EnvironmentProvider";
import { LocalizationProvider } from "@/common/presentation/providers/LocalizationProvider";
import { AppThemeProvider } from "@/common/presentation/providers/AppThemeProvider";
import { DialogManagerProvider } from "@/features/core/dialogs/presentation/DialogManagerProvider";
import { AppBootProvider } from "@/features/core/app-boot/presentation/AppBootProvider";
import { useFeatureFlag } from "@/features/core/feature-flags/business-logic/useFeatureFlag";
import { useOrientationPolicy } from "@/common/business-logic/hooks/useOrientationPolicy";

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
              <GestureHandlerRootView style={styles.flex}>
                <BottomSheetModalProvider>
                  <DialogManagerProvider>
                    <AppBootProvider>
                      <RootNavigator />
                      <AppToast />
                    </AppBootProvider>
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
