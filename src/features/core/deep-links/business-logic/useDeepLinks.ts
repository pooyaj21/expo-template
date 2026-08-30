import { useEffect, useRef } from "react";
import * as Linking from "expo-linking";
import { useAppRouter } from "@/common/business-logic/hooks/useAppRouter";
import { resolveDeepLink } from "@/features/core/deep-links/data-access/deepLinkTypes";

/**
 * Handles both entry points: a cold start from a link and a link arriving while
 * the app is already open. Mounted once by `CoreProviders`.
 *
 * Only links a resolver claims are pushed — anything else is left to
 * expo-router, whose own path matching already handles in-app URLs.
 */
export const useDeepLinks = () => {
  const router = useAppRouter();
  const routerRef = useRef(router);
  // The ref is written in an effect, not during render: React may render a
  // component more than once before committing, and a render-phase write is
  // not guaranteed to survive.
  useEffect(() => {
    routerRef.current = router;
  });

  useEffect(() => {
    const handle = (url: string | null) => {
      if (!url) return;
      const route = resolveDeepLink(url);
      if (route) routerRef.current.push(route);
    };

    // Cold start.
    void Linking.getInitialURL().then(handle);

    // Warm start.
    const subscription = Linking.addEventListener("url", ({ url }) =>
      handle(url),
    );
    return () => subscription.remove();
  }, []);
};
