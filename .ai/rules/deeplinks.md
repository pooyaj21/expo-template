---
description: "Deep link system — adding a destination (parser/dispatch, readiness queue, login replay, app.config / AASA / assetlinks)"
globs: src/deepLink/**/*.{ts,tsx},app.config.ts
alwaysApply: false
paths:
  - "src/deepLink/**/*.{ts,tsx}"
  - "app.config.ts"
---

# Deep Links — adding a destination

Procedure for "make a deep link for page X". The system is already wired; a new
destination is a fixed set of local edits — no architectural work.

## Architecture (fixed — do not restructure)

| File                                    | Role                                                                                                                  |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/deepLink/deepLinkActions.ts`       | Shared contract: `DeepLinkActionEnums`, the `DeepLinkAction` union, `LOGIN_REQUIRED_ACTIONS`, `FEATURE_GATED_ACTIONS` |
| `src/deepLink/websiteDeepLinkParser.ts` | **Parse**: URL → `DeepLinkAction \| null`. Pure, no hooks, no navigation. All new links go here                       |
| `src/deepLink/useDeepLinkSystem.ts`     | **Dispatch**: readiness queue, feature gate, login gate + replay, exhaustive `switch` into `useAppRouter`             |
| `src/deepLink/inAppActionDispatch.ts`   | Backend action buttons (`ActionInterface.target`) enter the same dispatcher without a URL round trip                  |
| `src/deepLink/useDebugDeepLink.ts`      | Dev-only scratch link (`<scheme>://debug`)                                                                            |
| `app.config.ts`                         | Which hosts and paths the OS hands to the app: `ios.associatedDomains` + the Android `intentFilters` whitelist        |

The split is the point: **parsing is a pure function you can reason about and
test, dispatch is a hook that owns every side effect.** Never navigate from the
parser, and never parse a URL inside the dispatcher's `switch`.

## Hosts and scheme

Universal-link hosts come from one comma-separated variable so a single value
covers every environment:

```bash
EXPO_PUBLIC_APP_LINK_HOSTS=example.com,web.stage.example.com,web.dev.example.com
```

- Runtime: `AppConfig.appLinkHosts` (parsed in `src/App.ts`).
- Prebuild: `app.config.ts` reads the same variable and emits `applinks:<host>`
  into `ios.associatedDomains` plus one `{ host }` entry per host in the Android
  `intentFilters`.

The custom scheme is declared once in `app.config.ts` (`scheme`). Scheme links
mirror the web path exactly — the first path word rides in the URL host slot, so
`https://example.com/example/42` and `myapp://example/42` parse identically. An
optional `/en` or `/ar` first segment is stripped before matching. The site root
`/` is the one exception: it has no path to mirror, so bare `myapp://` opens
home.

**Mirror the web route.** If the product has a website, the mobile path MUST be
the website's path for that page, character for character, including the query
contract. If the page does not exist on the web yet, invent the path following
the site's conventions and tell the user the web team must match it.

## Readiness queue

A link can arrive before there is anything to navigate to — cold start, splash
still up, root `<Stack>` not mounted. `useDeepLinkSystem` therefore never
navigates on arrival:

1. `Linking.getInitialURL()` / the `url` event **enqueue** the raw URL.
2. `drain()` runs on every change of app stage, pathname and login state, and
   returns early unless the root has settled (boot complete, and not parked on
   `/`, the auth route or onboarding).
3. Once settled, the queue is processed in arrival order.

That is why `useAppRouter` can safely drop a navigation issued before the
navigator exists: the only caller that must survive the gate queues itself.

## Login replay

`LOGIN_REQUIRED_ACTIONS` in `deepLinkActions.ts` lists the actions that need an
account. For one of those, the dispatcher stores the action, calls
`ensureUserLogin`, and replays it after a successful login (clearing it on
cancel). The destination's `loginGate` in `useAppRouter` gates the same screen a
second time for in-app navigation; both must agree — `LOGIN_REQUIRED_ACTIONS` is
what lets the link wait for the readiness queue before prompting.

A feature-flagged destination is additionally listed in `FEATURE_GATED_ACTIONS`
so a link to an off feature is dropped **before** the login prompt — see
[`.ai/rules/featureflags.md`](featureflags.md).

## Links the parser does not match

`parseWebsiteDeepLink` returns `null` and the link is dropped: the app opened
and stays where it is. No toast, no error screen, no not-implemented dialog —
the user tapped a link that this build has no destination for, and silence is
the correct outcome. (If the backend later grows a resolve endpoint for retired
link shapes, it hooks in exactly here, after the parser returns `null`, and its
answer is fed back through the same parser.)

## Wildcard policy — HARD RULE

**Claimed paths are precise. A wildcard is never a shortcut for "everything
under here."**

The only wildcard ever permitted is a **single trailing slug segment on a route
the parser actually handles** — `/example/*`, `/account/orders/*`. Nothing else.

| Forbidden                     | Why                                                   |
| ----------------------------- | ----------------------------------------------------- |
| `{"/": "/*"}`                 | Claims the entire site                                |
| `{"/": "/account/*"}`         | Swallows unhandled account subpages                   |
| `{"/": "/example/*/reviews"}` | Mid-path wildcard — enumerate the real routes instead |
| `pathPrefix` for a fixed page | Use the exact-path list                               |

Consequence of a broad claim: the OS hands the app a URL nothing answers, and
the user gets a dead end instead of the working website page.

Every claimed pattern must be **answered by a parser `case`**, and every parser
`case` must have a claimed pattern. A fixed page (`/account/notify-me`) is an
exact string on **both** sides — never `/account/notify-me/*` "just in case". A
route with both a bare and a slugged form is listed twice (exact + slug prefix),
not collapsed into one wildcard.

## Checklist for a new deep link

1. **Mirror the web route first** (see above). Decide the path and the query
   contract before touching code.
2. **`src/deepLink/deepLinkActions.ts`** — add an `OPEN_*` enum member + a union
   variant. Slugs/ids are required fields; query-derived extras are optional
   (`filters?: DeepLinkFilters; sort?: string`). Auth-only screen → add it to
   `LOGIN_REQUIRED_ACTIONS`. Flag-gated screen → add it to
   `FEATURE_GATED_ACTIONS`.
3. **`src/deepLink/websiteDeepLinkParser.ts`** — add a `case` on the first path
   segment (compare lowercase; the segments are already decoded, use them raw as
   slugs). Reject a malformed id by returning `null` rather than pushing `NaN`
   into a screen.
4. **`src/deepLink/useDeepLinkSystem.ts`** — add the `dispatch` case calling
   `routerEx.navigateTo.<x>Screen({ ... })`. The `action satisfies never`
   default makes a missed case a type error. If the target screen needs an
   object the link cannot carry, land on the nearest list screen and say so.
5. **`app.config.ts`** — add the path to the exact-path list (fixed page) or the
   slug-prefix list (trailing slug), obeying the wildcard policy. Locale
   variants (`/en`, `/ar`) are generated. This is a **native change** — it needs
   a new build, not an OTA update.
6. **AASA** — mirror the same entry in the `apple-app-site-association` file the
   web team deploys: an exact path adds `{"/": "/<path>"}` + its `/en/` and
   `/ar/` variants; a slug prefix adds `{"/": "/<path>/*"}` + locale variants —
   one trailing `*` and nothing broader. Android and iOS claims must stay
   identical; a path in one and not the other is a bug. Validate with
   `python3 -m json.tool`.

## Server-side files (not in this repo)

| File                                      | Who deploys it | Notes                                                                                                                                                                                 |
| ----------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/.well-known/apple-app-site-association` | web team       | JSON, `Content-Type: application/json`, no redirect. Apple's CDN caches it (refreshed around install/update). iOS ignores paths missing from it even though the app claims the domain |
| `/.well-known/assetlinks.json`            | web team       | Android app-link verification: package name + the release signing SHA-256. One file per claimed host                                                                                  |

Both must exist on **every** host in `EXPO_PUBLIC_APP_LINK_HOSTS`, or the link
opens the browser instead of the app on that environment.

## Dev-only scratch link (`<scheme>://debug`)

`myapp://debug` opens whatever `useDebugDeepLink` currently points at
(`src/deepLink/useDebugDeepLink.ts`). To retarget it, edit the body of `run` —
that is the entire workflow. It is a hook, so it can use the router, dialogs or
any use case.

It is the **one intentional exception** to "every parser case must have a
claimed `app.config.ts` pattern", and it must stay that way:

- **Custom scheme only.** The parser case checks `!isWebUrl`, so it can never
  respond to `https://<host>/debug`. Adding it to the claimed paths or the AASA
  file would claim a real website path in production builds — don't.
- **Dev only.** The case also checks `isDevelop`, so in a release build the URL
  parses to `null` and the link is inert.
- **No native change, no rebuild.** Scheme paths are claimed by `scheme`, so it
  works over OTA like any JS edit.

```bash
npx uri-scheme open "myapp://debug" --ios
npx uri-scheme open "myapp://debug" --android
```

## Report back to the user

- Both link forms: `https://<host>/<path>` and `<scheme>://<path>`, with
  `{slug}` placeholders, and whether the destination is login-gated or
  flag-gated.
- If the AASA/assetlinks files changed, say so — the web team must redeploy
  them to every claimed host before the link opens the app on iOS.
- If `app.config.ts` changed, say the link only works from the next native
  build.

## Verify

```bash
npx tsc --noEmit
npx prettier --check <changed files>
npx uri-scheme open "myapp://<path>" --ios
npx uri-scheme open "https://<host>/en/<path>" --android
```
