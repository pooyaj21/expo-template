import { BackHandler, Platform } from "react-native";
import { reportError } from "@/common/business-logic/observability/errorReporter";
import { isLocalDevelopment } from "@/features/core/environment/business-logic/appConfig";

const BOOT_ATTEMPTS = 3;

const exitApp = (reason: string) => {
  if (Platform.OS === "android") {
    BackHandler.exitApp();
    return;
  }
  setTimeout(() => {
    throw new Error(reason);
  }, 0);
};

/**
 * A boot step that never settles leaves the user on the native splash forever.
 * Retry, then quit loudly rather than hang silently. Never rejects — the
 * caller always marks ready.
 */
export const runBootStep = async (
  label: string,
  step: () => Promise<void>,
): Promise<void> => {
  for (let attempt = 1; attempt <= BOOT_ATTEMPTS; attempt += 1) {
    try {
      await step();
      return;
    } catch (error) {
      const isLastAttempt = attempt === BOOT_ATTEMPTS;

      if (isLocalDevelopment) {
        console.log(
          `boot step "${label}" failed (${attempt}/${BOOT_ATTEMPTS})`,
          error,
        );
      } else {
        reportError(error, { bootStep: label, attempt, isLastAttempt });
      }

      if (isLastAttempt) {
        exitApp(`Boot step "${label}" failed ${BOOT_ATTEMPTS} times`);
      }
    }
  }
};
