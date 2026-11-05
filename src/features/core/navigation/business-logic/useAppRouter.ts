import { Href, useNavigationContainerRef, useRouter } from "expo-router";
import { routes } from "@/common/business-logic/routes/paths";
import { isDevelop } from "@/features/core/environment/business-logic/appConfig";
import type { FlagName } from "@/features/core/feature-flags/business-logic/flagCatalog";
import { useFeatureFlagManager } from "@/features/core/feature-flags/business-logic/useFeatureFlag";

/**
 * Every destination goes through `router.push` / `replace`, so the stack only
 * grows — and expo-router keeps pushed screens mounted. A double tap on a cell,
 * or a cell that re-fires while the push animation runs, used to add a second
 * identical entry. Module scope on purpose: the guard has to span the two
 * different `useAppRouter()` instances a double tap can hit.
 */
const DUPLICATE_PUSH_WINDOW_MS = 700;
let lastPush: { key: string; at: number } | null = null;

const isDuplicatePush = (key: string) => {
  const now = Date.now();
  const isRepeat =
    lastPush?.key === key && now - lastPush.at < DUPLICATE_PUSH_WINDOW_MS;
  lastPush = { key, at: now };
  return isRepeat;
};

type ScreenOptions = {
  replace?: boolean;
  /** When set, navigation is a no-op while the flag is off (resolved at call time). */
  featureGate?: FlagName;
};

/** Routes whose params are all optional can be navigated to with no argument. */
type NavArgs<T> = Record<string, never> extends T ? [params?: T] : [params: T];

export type HomeParams = Record<string, never>;
export type NotFoundParams = Record<string, never>;
export type ExampleDetailParams = {
  id: string | number;
};

export const useAppRouter = () => {
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();
  const { isEnabled } = useFeatureFlagManager();

  // Drop navigation before the root navigator is ready — expo-router can throw
  // from above every error boundary and blank the tree.
  const canNavigate = () => {
    if (navigationRef.isReady()) return true;
    if (isDevelop) {
      console.log("[router] navigation ignored — root navigator not mounted");
    }
    return false;
  };

  const reset = () => {
    if (!canNavigate()) return;
    router.replace(routes.home());
  };

  const back = () => {
    if (!canNavigate()) return;
    if (!router.canGoBack()) {
      reset();
      return;
    }
    router.back();
  };

  const dismiss = (count?: number) => {
    if (!canNavigate()) return;
    router.dismiss(count);
  };

  const navigate = (href: Href, options?: { replace?: boolean }) => {
    if (!canNavigate()) return;

    if (options?.replace) {
      router.replace(href);
      return;
    }

    if (isDuplicatePush(String(href))) {
      if (isDevelop) {
        console.log(`[router] duplicate push to ${String(href)} dropped`);
      }
      return;
    }

    router.push(href);
  };

  const screen =
    <T extends object>(hrefFor: (params: T) => Href, options?: ScreenOptions) =>
    (...args: NavArgs<T>) => {
      const params = (args[0] ?? {}) as T;
      const featureGate = options?.featureGate;
      // Resolved at call time, not at render: a flag can flip between the two.
      if (featureGate != null && !isEnabled(featureGate)) {
        if (isDevelop) {
          console.log(
            `[featureFlag] navigation blocked — "${featureGate}" is off`,
          );
        }
        return;
      }
      navigate(hrefFor(params), { replace: options?.replace });
    };

  const navigateTo = {
    home: screen<HomeParams>(() => routes.home()),
    exampleDetail: screen<ExampleDetailParams>(
      (params) => routes.exampleDetail(params.id),
      { featureGate: "EXAMPLE_DETAIL" },
    ),
    notFound: screen<NotFoundParams>(() => routes.notFound()),
  };

  const push = (href: Href) => navigate(href);
  const replace = (href: Href) => navigate(href, { replace: true });

  return {
    navigateTo,
    push,
    replace,
    back,
    dismiss,
    reset,
    canGoBack: router.canGoBack,
  };
};
