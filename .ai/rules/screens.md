---
description: "Expo Router screens, navigation, route registration"
globs: src/app/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/app/**/*.{ts,tsx}"
---

# Expo Router Screens — `src/app/**/*.{ts,tsx}`

`src/app/` is reserved for route files. A route file is a **thin shell**: it reads its nav params, then renders the matching `*Screen` body from `src/features/`. All UI, data fetching, and logic live in `src/features/` — never here.

**NEVER** put business logic, Zustand stores, API calls, or reusable components in this folder.

## Folder Layout

Features are grouped into route folders, each with its own nested `<Stack>`:

```
src/app/
  _layout.tsx              # root Stack — providers, Sentry, deep links, toast, error boundaries
  index.tsx                # entry redirect (reads AppStage → the launch destination)
  +not-found.tsx           # unmatched route
  +native-intent.tsx       # native-intent hook; returns null until a project needs one
  (tabs)/                  # tab bar — see (tabs)/_layout.tsx
    _layout.tsx
    home.tsx
    profile.tsx
  example/                  # a feature folder — the worked example; delete it
    _layout.tsx            # nested Stack — registers index/list/detail
    index.tsx              # <Redirect> to the default leaf
    list.tsx               # thin shell → ExampleListScreen
    detail.tsx             # thin shell → ExampleDetailScreen (behind FeatureFlagEnums.EXAMPLE)
  auth/
    _layout.tsx
    index.tsx
    login.tsx              # thin shell → AuthScreen
  debug/                   # dev-only, guarded at both levels
    _layout.tsx
    index.tsx
    featureFlags.tsx
    network.tsx
```

## Adding a Screen

1. **Build the body in `src/features/`** — `src/features/<feature>/<Feature>Screen.tsx` (see Screen Body Pattern). Sub-components and helpers for that feature live in the same folder.
2. **Add the thin route file** under `src/app/`:
   - A feature with sub-routes → folder `src/app/<feature>/` with `_layout.tsx`, `index.tsx` (redirect), and one lowercase leaf file per route (`list.tsx`, `detail.tsx`, …).
   - A standalone screen → a flat file `src/app/<name>.tsx`.
3. **Register the route** in **two** places:
   - The leaf in its nested `src/app/<feature>/_layout.tsx` `<Stack>` (e.g. `<Stack.Screen name="detail" />`).
   - The folder (or flat file) name in the root `src/app/_layout.tsx` `<Stack>` (e.g. `<Stack.Screen name="example" />`).
4. **Add the destination** in `src/common/business-logic/hooks/useAppRouter.ts` — an entry on `navigateTo` built with `screen<XParams>("/<feature>/<leaf>", options)`, plus its `<Name>Params extends NavParams` interface in the same file.
5. Dev-only screens go under `src/app/debug/` and **must** be inside `<Stack.Protected guard={AppConfig.isDevelop}>` — in the root `src/app/_layout.tsx` _and_ again in `src/app/debug/_layout.tsx`, so a release build has no debug route to restore saved navigation state into.

Global wiring (providers, Sentry init, deep links, toast, splash, error boundaries) lives in `src/app/_layout.tsx` — do not reproduce it elsewhere.

### Nested `_layout.tsx`

Every feature folder ships the same `<AppStack>` boilerplate (no native header, the platform Material slide on Android and an RTL-mirrored slide on iOS, full-screen iOS back swipe, `freezeOnBlur`) and only differs in its `<Stack.Screen name=…>` list. To change an option for one stack, pass `screenOptions` to `AppStack` — object or function form — and it is merged over the base; never copy the base options into a layout. Don't set `gestureDirection` for RTL: UIKit mirrors the back swipe itself.

```tsx
export default function RootLayout() {
  const isExampleEnabled = useFeatureFlag(FeatureFlagEnums.EXAMPLE);

  return (
    <AppStack>
      <Stack.Screen name="index" />
      <Stack.Screen name="list" />
      <Stack.Protected guard={isExampleEnabled}>
        <Stack.Screen name="detail" />
      </Stack.Protected>
    </AppStack>
  );
}
```

A flag-gated route carries **both** guards: `featureGate` on the destination stops the navigation, and `<Stack.Protected>` here stops saved navigation state from a build where the flag was on from restoring into a screen that no longer exists.

`index.tsx` redirects to the default leaf and forwards the serialized `params`, so a link that lands on the folder keeps them:

```tsx
export default function Index() {
  const { params } = useLocalSearchParams();

  return (
    <Redirect
      href={{
        pathname: "/example/list",
        params: params ? { params: params as string } : undefined,
      }}
    />
  );
}
```

## Route File Pattern (the thin shell)

A leaf route file reads its params and delegates — nothing else:

```tsx
import { ExampleDetailParams } from "@/common/business-logic/hooks/useAppRouter";
import { useNavPrams } from "@/common/business-logic/hooks/useNavPrams";
import ExampleDetailScreen from "@/features/exampleDetail/ExampleDetailScreen";

export default function Detail() {
  const params = useNavPrams<ExampleDetailParams>();

  return <ExampleDetailScreen params={params} />;
}
```

`useNavPrams<T>()` `JSON.parse`s the single serialized `params` query key and returns `{}` when it is absent or malformed — a truncated universal link must not take the screen to the crash fallback. A route whose body takes no params skips the hook and renders the body directly (`src/app/home.tsx`, `src/app/debug/index.tsx`).

## Screen Body Pattern — `src/features/<feature>/<Feature>Screen.tsx`

The body is a component typed with `ScreenParams<T>` (from `useAppRouter`). This is where `PageContainer`, the toolbar, `StateHandler`, use-case hooks, and navigation live:

```tsx
import { ExampleListParams, ScreenParams, useAppRouter } from "@/common/business-logic/hooks/useAppRouter";

const ExampleListScreen = ({}: ScreenParams<ExampleListParams>) => {
  const { getString } = useLocalizationContext();
  const { list, isLoading, error, isEmpty, refetch, pagination } =
    useExampleList();

  return (
    <PageContainer safeEdges="top">
      <AppToolbar backIcon title={getString("shared_seeAll")} />
      <StateHandler data={list} error={error} isLoading={isLoading} isEmpty={isEmpty} retry={refetch}>
        {(items) => <AppList data={items} pagination={pagination} renderItem={…} />}
      </StateHandler>
    </PageContainer>
  );
};

export default ExampleListScreen;
```

Rules:

- The entry component is named `<Feature>Screen` and default-exported. Feature-specific sub-components and helpers live in the same `src/features/<feature>/` folder.
- Wrap every screen in `<PageContainer>` (safe areas, status bar, Android nav bar, background). Use `safeEdges` to opt out of top/bottom padding when you render your own toolbar or bottom bar.
- Use `<AppToolbar>` for headers — not `<Stack.Screen options={{ headerShown: … }}>`. `AppStack` disables native headers everywhere.
- Use `<StateHandler>` for any screen that renders remote data; it owns the loading / error / empty branches.
- Consume **use cases** only — no `useQuery`, no axios, no direct store writes from a screen.

### Tab screens

Tab routes (`src/app/<noun>.tsx`) delegate to a `*Screen` body like any other route, but they take **no nav params**: they render the body with no props (`<HomeScreen />`) and the body declares none. Their bottom inset comes from `useAppNavigationBarDimension()` (`@/common/presentation/components/app/AppTabBar`), because the tab bar floats over the content — not from `useSafeAreaInsets()`.

## Navigation

Never call `useRouter()` / `router.push()` directly in a screen. Use `useAppRouter()`:

```tsx
const router = useAppRouter();
router.navigateTo.exampleDetailScreen({ id: item.id });
router.navigateTo.homeScreen(); // no argument when every param is optional
router.back();
```

- Destinations are declared in `src/common/business-logic/hooks/useAppRouter.ts` with `screen<XParams>("/<feature>/<leaf>", options)`, which JSON-serializes the params into a single `params` query key. `NavArgs` makes a destination whose params are all optional callable with no argument at all.
- Every nav params type extends `NavParams`. `ScreenParams<T>` (`{ params: T }`) is the prop shape every `*Screen` body receives.
- Identical pushes fired inside 700 ms are dropped (double tap on a cell, or a cell re-firing during the push animation) — don't add your own debounce on top.
- `reset()` replaces the stack with the root. It is also the fix for a runtime language switch: flipping direction only takes effect on a remount.
- A navigation issued before the root navigator mounts is **dropped on purpose** — expo-router throws from above every error boundary, which would blank the app. Callers that must survive the boot gate queue themselves; that is what the deep-link readiness queue does.
- To return a value to the previous screen, pass a callback token via `putCallback` (`src/common/business-logic/hooks/navCallbacks.ts`) and read it with `getCallback` — never a raw function, which cannot survive `JSON.stringify`.

### Gated destinations

Both gates live on the destination, never inside the screen body:

```ts
exampleDetailScreen: screen<ExampleDetailParams>("/example/detail", {
  featureGate: FeatureFlagEnums.EXAMPLE,
}),
profileScreen: screen<ProfileParams>("/profile", {
  loginGate: LoginGateEnums.REQUIRED,
}),
```

- `featureGate` resolves at call time through `isFeatureEnabled` — an off flag makes the navigation a no-op (logged in development).
- `loginGate`: `REQUIRED` sends a guest to `/auth/login`; `GUEST_ALLOWED` does the same but the auth screen also offers guest login; `NONE` (default) is omitted. `screen()` calls `ensureUserLogin({ onSuccess: … })`, so after a successful login the auth screen pops and the original navigation — params and `replace` included — replays automatically.
- **Never** re-implement `if (isUserLogin) navigate() else ensureUserLogin(...)` in a screen, and never gate a route with a `return null` in the body: that leaves a reachable route and a blank back-stack entry. `useLoginControllerContext` stays the right tool only for non-route gates (a dialog, an explicit "Sign in" button, the 401 interceptor).

## Deep Links & External URLs

- The system lives in `src/deepLink/`: the contract in `deepLinkActions.ts` (`DeepLinkActionEnums`, `DeepLinkAction`, `isLoginRequiredAction`, `featureGateForAction`), one parser in `websiteDeepLinkParser.ts`, and the dispatcher in `useDeepLinkSystem.ts` (readiness queue, feature gate, login gate with post-login replay) — mounted once, in `src/app/_layout.tsx`.
- Adding a destination: follow [`.ai/rules/deeplinks.md`](../.ai/rules/deeplinks.md) — enum member + union variant, a `case` in the parser, a `case` in the dispatcher, plus `appLinkPaths` in `app.config.ts` for a new top-level path segment.
- Never `Linking.openURL` an in-app route — navigate through `useAppRouter`.
- For a backend-driven button or banner, call `handleAction(action: ActionInterface)` from `useAppRouter`; it tries the in-app dispatcher for `INTERNAL` targets and falls back to the OS.

## Dialogs from screens

Use the dialog manager hook for shared dialogs — never import a shared dialog component into a screen:

```tsx
const dialogs = useDialogManager();
dialogs.textDetail.present({ title, text, confirmedButton });
dialogs.textDetail.dismiss();
```

A sheet only one screen opens stays local to that screen — see [`src/features/core/dialogs/.ai/rules/`](../src/features/core/dialogs/.ai/rules/).
