import * as Sentry from "@sentry/react-native";
import { AppConfig } from "@/common/data-access/config/AppConfig";

let initialized = false;

/** Light Sentry bootstrap — no-ops until `EXPO_PUBLIC_SENTRY_DSN` is set. */
export const initSentry = () => {
  if (initialized) return;
  initialized = true;

  const dsn = AppConfig.sentryDsn;
  if (!dsn) return;

  Sentry.init({
    dsn,
    enabled: !AppConfig.isExpoGo,
    tracesSampleRate: AppConfig.isDevelop ? 1 : 0.2,
    enableNativeCrashHandling: true,
  });
};

export const captureException = (
  error: unknown,
  context?: Record<string, unknown>,
) => {
  if (!AppConfig.sentryDsn) {
    if (AppConfig.isDevelop) console.error("[sentry]", error, context);
    return;
  }
  Sentry.captureException(error, context ? { extra: context } : undefined);
};
