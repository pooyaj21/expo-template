import { useEffect, useState } from "react";

/** Debounce a fast-changing value (search input) before it reaches a query. */
export const useDebouncedValue = <T>(value: T, delayMs = 400): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
};
