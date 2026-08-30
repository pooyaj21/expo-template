import { SplashScreen, Stack } from "expo-router";
import { AppConfig } from "@/common/data-access/config/AppConfig";
import { AppErrorBoundary } from "@/common/presentation/components/AppErrorBoundary";
import { CoreProviders } from "@/features/core/CoreProviders";

SplashScreen.preventAutoHideAsync();

/**
 * Global wiring lives here and only here: the error boundary, the providers,
 * and the route registry. `AppBootstrap` (inside `CoreProviders`) owns the
 * splash and decides when this stack may mount.
 */
export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <CoreProviders>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="example" />
          <Stack.Screen name="settings" />
          <Stack.Protected guard={AppConfig.isDevelop}>
            <Stack.Screen name="debug" />
          </Stack.Protected>
        </Stack>
      </CoreProviders>
    </AppErrorBoundary>
  );
}
