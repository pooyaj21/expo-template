// Dev-only structured console output. Lives in data-access so the axios
// interceptors can use it; every other layer may import it too.
export const prettyLog = (label: string, data?: unknown): void => {
  if (!__DEV__) return;
  const timestamp = new Date().toISOString();
  if (data === undefined) {
    console.log(`\n[${timestamp}] ${label}`);
    return;
  }
  console.log(`\n[${timestamp}] ${label}:\n`, JSON.stringify(data, null, 2));
};
