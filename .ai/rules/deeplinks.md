---
description: "Deep links — app scheme, universal/app links, +native-intent parse point, mapping to useAppRouter"
globs: src/app/+native-intent.tsx,app.config.js,src/features/core/navigation/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/app/+native-intent.tsx"
  - "app.config.js"
  - "src/features/core/navigation/**/*.{ts,tsx}"
---

# Deep Links

Procedure for wiring an inbound URL to an in-app destination. Keep parsing in one place and navigate only through `useAppRouter` — never call `router.push` with a raw deep-link path from a screen.

## Architecture (fixed)

| Piece                                                         | Role                                                                                                                                                                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `app.config.js`                                               | Declares the **custom scheme** (from `IDENTITY.scheme` + flavor suffix, e.g. `apptemplate-develop`) and, when `APP_LINK_HOSTS` is set, iOS `associatedDomains` + Android `intentFilters` (`autoVerify`) | }   |
| `src/app/+native-intent.tsx`                                  | **Single parse point.** Export `redirectSystemPath({ path, initial })` — normalize / remap the system path before Expo Router opens a route. Returning `null` keeps the default path                    |
| `src/features/core/navigation/business-logic/useAppRouter.ts` | Typed destination catalog. Deep-link handlers call `navigateTo.*` — they do not invent path strings                                                                                                     |
| `src/common/business-logic/routes/paths.ts`                   | Canonical path builders the router catalog is built on                                                                                                                                                  |

Flow:

1. OS / browser opens `<scheme>://…` (flavor-suffixed) or an associated `https://…` URL.
2. `redirectSystemPath` parses host + path + query into a known destination (or rejects it).
3. The handler navigates with `useAppRouter().navigateTo.<destination>(…)` (or returns a remapped Expo path that lands on a thin `src/app/` shell which then navigates).
4. Feature-flag gates on the destination run inside `useAppRouter` at call time — a gated destination is a **no-op** (or falls through to `notFound`), never `return null` inside a mounted screen.

## Custom scheme

- Source of truth: `IDENTITY.scheme` in `app.config.js`, plus flavor suffix (`-develop` / `-stage` / none). Template develop default: `apptemplate-develop`.
- Form: `<scheme>://<path>[?<query>]` — keep paths aligned with `routes` helpers (e.g. `apptemplate-develop://example/42` → `navigateTo.exampleDetail({ id: "42" })`).
- Changing the scheme is a **native** change — needs a new binary, not OTA. Use `npm run rename` to change the base scheme.

## Universal links (iOS) / App Links (Android)

Driven by **`APP_LINK_HOSTS`** (comma-separated) in `.env`. Empty / unset → no `associatedDomains` / `intentFilters`.

When hosts are set:

1. **`app.config.js`** (already wired)
   - iOS: `ios.associatedDomains: ["applinks:<host>", …]`.
   - Android: `android.intentFilters` with `autoVerify: true`, `https` scheme, host(s), and **precise** `path` / `pathPrefix` entries for every route the parser answers (template: `/` + `/example/`).
2. **Hosted association files** (web team / CDN) — start from `docs/deeplinks/`:
   - iOS: `https://<host>/.well-known/apple-app-site-association` — `appIDs` = `<TEAMID>.<bundleId>` (include flavor suffixes you ship), paths mirroring the claimed routes (`Content-Type: application/json`, no redirect).
   - Android: `https://<host>/.well-known/assetlinks.json` — package name(s) + SHA-256 cert fingerprints.
3. **Claim precisely.** Every claimed path must be answered by the parser / `useAppRouter` destination. Do not claim `/*` or a feature-wide wildcard that swallows unhandled pages — the OS will open the app into a dead end instead of the website.
4. **Local open helper:** `bash scripts/deeplink.sh <url>` (see `scripts/deeplink.env` for `{TOKEN}` placeholders).

## `+native-intent.tsx` — single parse point

```ts
// src/app/+native-intent.tsx
export const redirectSystemPath = ({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) => {
  // 1. Strip scheme / host if present; normalize locale prefixes if any.
  // 2. Match path → known destination.
  // 3. Unknown → remap to the not-found route (or return routes.notFound()).
  // 4. Returning null keeps Expo Router's default handling.
  return null;
};
```

Rules:

- **One** parse implementation — do not re-parse the same URL in screens, providers, or feature hooks.
- Map successful parses onto `useAppRouter` destinations (home, `exampleDetail`, …). Add a destination to the catalog before claiming a new link shape.
- Apply the same **featureGate** the in-app entry uses. If the flag is off, do not open a half-disabled screen — no-op or send the user to `notFound`.
- Unknown / malformed links → `navigateTo.notFound()` / remap to `routes.notFound()`. Never leave the user on a blank stack entry.
- Cold start (`initial: true`) and warm links share the same mapper; queueing until boot finishes belongs next to app-boot if the root navigator is not ready yet (`useAppRouter` already drops navigations while `navigationRef` is unready).

## Adding a destination

1. Add / reuse a path helper in `src/common/business-logic/routes/paths.ts`.
2. Register a thin route under `src/app/` and a `navigateTo.*` entry in `useAppRouter` (with `featureGate` when needed).
3. Extend the `+native-intent` mapper for the inbound path / query contract.
4. If using universal / app links, add the matching exact path or single trailing-slug claim in `app.config.js` **and** the hosted AASA / assetlinks files — keep those lists identical.
5. Document the link forms you support (`<scheme>://…` and `https://<host>/…`) for QA.

## Verify

```bash
# Custom scheme (simulators / emulators) — develop flavor shown
bash scripts/deeplink.sh "apptemplate-develop://example/1"
npx uri-scheme open "apptemplate-develop://example/1" --ios
npx uri-scheme open "apptemplate-develop://example/1" --android

# iOS simulator https (after APP_LINK_HOSTS + AASA)
xcrun simctl openurl booted "https://<host>/example/1"

# Android app link (after intentFilters + assetlinks)
adb shell am start -a android.intent.action.VIEW -d "https://<host>/example/1"
```

Also run `npm run type:check` after mapper / catalog changes.
