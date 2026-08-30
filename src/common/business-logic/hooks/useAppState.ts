import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

/**
 * Foreground / background transitions. `onForeground` is where a token refresh
 * or a stale-data refetch belongs — not in a mount effect, which never fires
 * again after the app is backgrounded for an hour.
 */
export const useAppState = (callbacks?: {
  onForeground?: () => void;
  onBackground?: () => void;
}) => {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const callbacksRef = useRef(callbacks);
  // The ref is written in an effect, not during render: React may render a
  // component more than once before committing, and a render-phase write is
  // not guaranteed to survive.
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      setAppState((previous) => {
        if (previous.match(/inactive|background/) && next === "active") {
          callbacksRef.current?.onForeground?.();
        } else if (previous === "active" && next.match(/inactive|background/)) {
          callbacksRef.current?.onBackground?.();
        }
        return next;
      });
    });

    return () => subscription.remove();
  }, []);

  return { appState, isActive: appState === "active" };
};
