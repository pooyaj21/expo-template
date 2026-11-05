---
name: screen
description: Add a route / screen with Expo Router — thin shell in src/app/, page in features/*/presentation, registration in _layout, paths.ts helper. Use when adding a page, route, tab or navigation destination, or moving a screen.
---

# Add a screen / route

Rules: `.ai/rules/screens.md`, `.ai/rules/architecture.md`, `.ai/rules/featureflags.md`.

## Steps

1. **Page body** — `src/features/<feature>/presentation/<Feature>Page.tsx`. Holds UI, data (via BL hooks) and logic. Built for phone and tablet. Tagged with `testID`s.
2. **Route shell** — `src/app/<…>.tsx`. Thin: read params, render the page. No logic, no API, no store.
3. **Register** in the owning `_layout.tsx` Stack.
4. **Path helper** — add `routes.<name>(…)` in `src/common/business-logic/routes/paths.ts`. Never hardcode path strings at call sites.
5. **Flag** — if gated, use `useFeatureFlag` at navigation / layout level.
6. **Tab** — lowercase nouns under `src/app/(tabs)/`.
7. **Verify** — `verify` skill, navigate on both platforms, en + ar, phone + tablet when layout is involved.
