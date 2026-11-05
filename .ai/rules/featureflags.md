---
description: "Feature flags — one source per flag (env | server), useFeatureFlag, catalog defaults"
globs: src/features/core/feature-flags/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/features/core/feature-flags/**/*.{ts,tsx}"
---

# Feature flags

A flag answers one question — **is this feature on for this user, on this build, right now** — and it is answered in one place. Screens never read `process.env` and never re-derive enablement from the presence of data.

## One source per flag

Each flag in the catalog declares **exactly one** source:

| Source       | Where it comes from                                         | Fallback        |
| ------------ | ----------------------------------------------------------- | --------------- |
| **`env`**    | `EXPO_PUBLIC_FLAG_<NAME>` (literal name — babel inlines it) | catalog default |
| **`server`** | `GET {API_BASE_URL}/feature-flags` at boot                  | catalog default |

Types stop a flag being read from the wrong source. There is no layered "server over env over default" merge for a single flag — pick one source when you add it.

Dev overrides (debug menu) may still force a value in develop builds; that is a debug affordance, not a third catalog source.

## Reading a flag

```tsx
import { useFeatureFlag } from "@/features/core/feature-flags/business-logic/useFeatureFlag";

const isExampleDetailEnabled = useFeatureFlag("EXAMPLE_DETAIL");
```

- `useFeatureFlag(name)` — typed per the catalog / source. Re-renders when the flag flips.
- Catalog lives in `src/features/core/feature-flags/business-logic/flagCatalog.ts`.

## Gating UI and routes

- Hide entry points when a flag is off — leave no dead affordance.
- Gate expensive fetches with `{ enabled: isFlagEnabled }` on the query / BL hook.
- Prefer gating navigation / layout registration over mounting a page and `return null`.

## Adding a flag

1. Add the entry to `flagCatalog.ts` with its **single** source and default (`false` for new features).
2. If `env`: add `EXPO_PUBLIC_FLAG_<NAME>` to `.env`, `.env.example`, and `docs/build-and-release.md`. Read it only inside the environment / flag wiring — never in a screen.
3. If `server`: ensure boot fetches `/feature-flags` and the flag name matches the payload.
4. Gate routes, entry points, and queries.

## Don'ts

- ❌ Don't read `process.env.EXPO_PUBLIC_FLAG_*` outside the flag / environment wiring.
- ❌ Don't give one flag both `env` and `server` sources.
- ❌ Don't add a flag for a feature you are shipping unconditionally.
- ❌ Don't branch on raw settings / response fields a flag already covers.
