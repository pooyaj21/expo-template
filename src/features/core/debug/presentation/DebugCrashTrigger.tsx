import React, { useSyncExternalStore } from "react";

// The debug menu renders above the app, outside the app's error boundary, so
// the forced crash is thrown here (mounted inside that boundary) to preview
// InternalError.
let crashRequested = false;
const listeners = new Set<() => void>();

export const requestDebugCrash = () => {
  crashRequested = true;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getCrashRequested = () => crashRequested;

export const DebugCrashTrigger = (): React.ReactNode => {
  const shouldCrash = useSyncExternalStore(
    subscribe,
    getCrashRequested,
    getCrashRequested,
  );
  if (shouldCrash) {
    // Reset first so the boundary's Retry renders the app again.
    crashRequested = false;
    throw new Error("Debug: forced render crash to preview InternalError page");
  }
  return null;
};
