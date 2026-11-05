import NetInfo from "@react-native-community/netinfo";
import { focusManager, onlineManager } from "@tanstack/react-query";
import { AppState, Platform, type AppStateStatus } from "react-native";

let onlineSetupDone = false;
let focusSetupDone = false;

/**
 * Bridge NetInfo → React Query `onlineManager` so reconnect resumes paused
 * queries. Idempotent — safe to call once from the root layout.
 */
export const setupOnlineManager = (): void => {
  if (onlineSetupDone) return;
  onlineSetupDone = true;

  onlineManager.setEventListener((setOnline) => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(
        Boolean(state.isConnected) && state.isInternetReachable !== false,
      );
    });
    return unsubscribe;
  });
};

/**
 * Bridge RN `AppState` → React Query `focusManager` so returning to the
 * foreground refetches stale queries (`refetchOnWindowFocus`). Idempotent.
 */
export const setupFocusManager = (): void => {
  if (focusSetupDone) return;
  focusSetupDone = true;

  const onAppStateChange = (status: AppStateStatus) => {
    if (Platform.OS !== "web") {
      focusManager.setFocused(status === "active");
    }
  };

  onAppStateChange(AppState.currentState);
  // App-lifetime subscription — never torn down for the process lifetime.
  AppState.addEventListener("change", onAppStateChange);
};

/**
 * One-shot wiring for React Query's online + focus managers on React Native.
 * Call once from the root layout (near `QueryClientProvider`) — see
 * `.ai/rules/network.md` / `.ai/rules/state.md`.
 */
export const setupQueryManagers = (): void => {
  setupOnlineManager();
  setupFocusManager();
};
