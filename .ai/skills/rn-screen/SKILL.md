---
name: rn-screen
description: Add a route / screen with Expo Router — thin shell in src/app/, screen body in src/features/, registration in both _layout files, useAppRouter destination with login/feature gates. Use when adding a page, route, tab or navigation destination, or moving a screen.
---

# expo-template — add a screen / route

Rules: `.ai/rules/screens.md`, `.ai/rules/featureflags.md`. Reference: `src/app/example/` + `src/features/example/presentation/`.

## Steps

1. **Screen body** — `src/features/<feature>/<Feature>Screen.tsx` (PascalCase). Holds all UI, data (via use cases) and logic. Reads params with `ScreenParams<T>`.

2. **Route shell** — `src/app/<feature>/<leaf>.tsx` (lowercase: `list.tsx`, `detail.tsx`) or a flat `src/app/<name>.tsx`. Thin: read params with `useNavPrams`, render the `*Screen`. No logic, no API, no store, no components defined here. Dev-only routes go under `src/app/debug/` inside `Stack.Protected guard={AppConfig.isDevelop}`.

3. **Register at both levels**
   - Leaf: `<Stack.Screen name="<leaf>" />` in `src/app/<feature>/_layout.tsx` (create the layout if the folder is new).
   - Folder (or flat file): `<Stack.Screen name="<feature>" />` in root `src/app/_layout.tsx`.
     Missing either one = route silently not found or wrong header/animation.

4. **Router destination** — `src/common/business-logic/hooks/useAppRouter.ts`: add a `<Feature>Params extends NavParams` interface and a destination built the same way as the neighbours. Gates go **here**: `loginGate` for auth-only screens, `featureGate: FeatureFlagEnums.X` for flagged ones. Never `return null` in a screen body to gate it, and never call `useRouter()` from a screen.

5. **Deep link (only if the website has the same page)** — `.ai/rules/deeplinks.md`; mirror the website route.

6. **Tab** — tab routes are lowercase nouns in `src/app/`; follow the existing tab layout. Tab entry behaviour uses `TabEntryEnums` on the destination (`RETURN` vs `PUSH`) — see `useAppRouter`.

7. **Verify** — `rn-verify`, then navigate to it on both platforms, en + ar.
