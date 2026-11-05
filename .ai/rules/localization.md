---
description: "i18n / localization (en + ar, RTL) — all user-facing text MUST use localization"
alwaysApply: true
---

# Localization (en + ar, RTL) — applies everywhere

The app ships **English + Arabic** and renders RTL for Arabic. i18n is **in-house** (no third-party localization SDK): local `en.json` / `ar.json`, a typed `MessageKey` derived from en, and hooks from `common/business-logic/hooks/useLocalization`.

## Hard rule: every user-facing string goes through localization

**NEVER** hard-code a user-facing string anywhere in `src/app/` or `src/`. Applies to:

- `<Text>` / `<AppText>` children
- `placeholder`, `accessibilityLabel`, `accessibilityHint`, `title` props
- Alert / toast / snackbar messages
- Tab / screen / header titles, button labels, empty-state copy, validation errors
- Static arrays / `const` lookup tables that feed any of the above (store the `MessageKey`, resolve with `getString` at render time)

```tsx
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";

const { getString, getStringWithReplacement, language, getDirection, isRTL } =
  useLocalization();

<Text>{getString("example_list_title")}</Text>
// Replacement: the string holds positional placeholders `[##p0]`, `[##p1]`, …
<Text>{getStringWithReplacement("cart_items_count", count.toString())}</Text>
```

### Limited exceptions (no localization needed)

- Brand / proper nouns identical in every language.
- Pure debug logs gated on develop flavor.
- Non-rendered identifiers: query keys, storage keys, route names, test IDs, flag names.

When in doubt, add the key.

## Adding new strings

- Keys follow `<feature>_<subject>_<variant>` (e.g. `example_list_title`).
- Add the key to **both** `en.json` and `ar.json`. `MessageKey` is derived from the English table in `src/common/business-logic/localization/localizationTypes.ts` — never cast a raw string to it.
- For interpolation use `getStringWithReplacement(key, ...values)`. Values must be strings — call `.toString()` yourself. ICU constructs are not supported.
- **Never** hand-roll substitution with `getString(key).replace(…)`.

## RTL behaviour

- Prefer logical edges (`marginStart` / `paddingEnd` / `start` / `end`).
- Branch on direction with `getDirection() === "rtl"` or `isRTL`.
- Fonts switch with language via the theme font map (Inter for en, IBM Plex Sans Arabic for ar).
- Language choice is persisted; device locale is the fallback on first launch.

## Language switching

`setLanguage("en" | "ar")` updates copy, direction, and fonts. Query keys include language via `useDefaultQueryKey`, so caches do not leak across languages.
