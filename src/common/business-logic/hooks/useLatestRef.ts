import { useInsertionEffect, useRef } from "react";

// Writing `ref.current` during render is a side effect: React may discard that
// render pass, and with the React Compiler enabled it also opts the whole
// component out of auto-memoization.
//
// The commit has to happen in `useInsertionEffect`, not `useEffect`: insertion
// effects for the entire tree run before any layout or passive effect, so a
// child whose mount effect fires work (a request, a deep-link dispatch) still
// reads the parent's current value rather than the previous render's. This is
// the same mechanism React's own `useEffectEvent` polyfill relies on.
export const useLatestRef = <T>(value: T) => {
  const ref = useRef(value);
  useInsertionEffect(() => {
    ref.current = value;
  });
  return ref;
};
