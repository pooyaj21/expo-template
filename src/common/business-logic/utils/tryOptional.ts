/** Run something that may throw and fall back instead of taking a screen down. */
export const tryOptional = <T>(resolve: () => T, fallback: T): T => {
  try {
    return resolve();
  } catch {
    return fallback;
  }
};

/** Format a value for display without an `undefined` ever reaching the UI. */
export const safeString = (
  resolve: () => string | number | null | undefined,
): string => {
  try {
    const value = resolve();
    return value == null ? "" : String(value);
  } catch {
    return "";
  }
};
