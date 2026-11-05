export type ErrorReporter = (
  error: unknown,
  context?: Record<string, unknown>,
) => void;

let reporter: ErrorReporter = (error, context) => {
  if (context) {
    console.error("[errorReporter]", error, context);
    return;
  }
  console.error("[errorReporter]", error);
};

export const setErrorReporter = (next: ErrorReporter): void => {
  reporter = next;
};

export const reportError = (
  error: unknown,
  context?: Record<string, unknown>,
): void => {
  reporter(error, context);
};
