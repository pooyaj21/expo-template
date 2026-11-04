---
name: rn-bugfix
description: Fix a bug the house way — reproduce, locate the layer, check Sentry and known traps, minimal fix, verify on both platforms. Use when asked to fix a bug, crash, wrong behaviour, a Sentry issue, or "X doesn't work on Android/iOS".
---

# expo-template — fix a bug

## 1. Pin the symptom

- Platform(s), flavor (development / stage / production), language (en / ar — RTL bugs only show in ar), logged in or not.
- Sentry: filter the production environment for real users. A stack rooted at `/Users/...` is a local dev build — say so.
- Errors prefixed `Debug:` come from debug screens on purpose.

## 2. Check the known traps first

Read the Project traps section in `.ai/rules/general.md`. Feature-specific traps live in `.ai/rules/<feature>.md` (deep links, feature flags, …).

## 3. Locate the layer

Follow the chain from the screen down and stop at the first layer that is wrong:

`src/app/` shell → `src/features/` → use case → queries → api → entity / store / context / component.

## 4. Minimal fix

- Fix the owning layer; don't paper over it in the screen.
- Match surrounding code style. No drive-by refactors.

## 5. Verify

`rn-verify`, then reproduce the original steps on both platforms (and ar if RTL-related).
