---
description: "i18n / localization (en + ar, RTL) — all user-facing text MUST use localization"
alwaysApply: true
---

# Localization (en + ar, RTL) — applies everywhere

The app ships **English + Arabic** and renders RTL for Arabic. Copy is served by the localization backend at runtime; the app only ships keys.

## Hard rule: every user-facing string goes through localization

**NEVER** hard-code a user-facing string anywhere in `src/app/` or `src/`. Applies to:

- `<Text>` children
- `placeholder`, `accessibilityLabel`, `accessibilityHint`, `title` props
- `Alert.alert(...)` / toast / snackbar messages
- Tab / screen / header titles, button labels, empty-state copy, validation errors
- Static arrays / `const` lookup tables that feed any of the above (store the `AppStringKey`, resolve with `getString` at render time)

```tsx
import { useLocalizationContext } from "@/common/presentation/providers/LocalizationsContext";

const { getString, getStringWithReplacement, getActiveLanguage, getDirection } =
  useLocalizationContext();

<Text>{getString("login_title")}</Text>
// Replacement: the string holds positional placeholders `[##p0]`, `[##p1]`, … —
// pass the values in order; never hand-roll `.replace`.
<Text>{getStringWithReplacement("example_items_count", count.toString())}</Text>
```

```tsx
// ❌ BAD — hard-coded copy, even inside a "data" array
const ITEMS = [{ id: "profile", title: "Your profile" }];

// ✅ GOOD — store the key, resolve at render time
const ITEMS: { id: string; titleKey: AppStringKey }[] = [
  { id: "profile", titleKey: "profile_title" },
];
<Text>{getString(item.titleKey)}</Text>;
```

### Limited exceptions (no localization needed)

- Brand / proper nouns identical in every language.
- Pure debug logs gated on `AppConfig.isDevelop` (`console.log`, dev-only screens under `src/app/debug/`).
- Non-rendered identifiers: query keys, storage keys, route names, test IDs.

When in doubt, add the key.

## Adding new strings

- Keys follow `<feature>_<subject>_<variant>` (e.g. `login_title`, `login_email_emptyError`). Keep the feature prefix consistent with neighbouring keys.
- **No prefix = copy shared with every other client of the same localization backend** (web, admin, a second app). That is the default. Before inventing a key, check whether another client already names that string and reuse its name — the table is shared, so two names for one string is a bug.
- **`mobile_` prefix** = the string exists only because of a native/device affordance: OS pickers, bottom-sheet `Apply` buttons, device-capability failures (no mail app, no dialer, file picker, save-to-device), native `Alert` shape (title/message/OK), app-shell version rows, store-update prompts, first-run language selection, onboarding carousel. Never add another client's prefix (`web_`, `admin_`) here.
- Add the key to the `AppStringKey` union in `src/common/business-logic/localization/strings.ts`, and add the `en` + `ar` copy on the localization backend. There is no bundled string table — a key the server does not return renders as the key itself, so the app ships the key and the server ships the copy.
- `AppStringKey` is the source of truth — never cast a raw string to it.
- For interpolation use `getStringWithReplacement(key, ...values)` (re-exported on the localization context). The backend serves **positional** placeholders — `[##p0]`, `[##p1]`, … — and the values fill them in order; a placeholder with no value is left as-is. Values must be strings — call `.toString()` yourself. ICU constructs (`{count, plural, …}`) are not supported.
- **Never** hand-roll substitution with `getString(key).replace(…)`. `String.replace` with a string pattern only swaps the _first_ match, and a bare token can collide with surrounding copy.

## Language-aware URLs

A URL that differs per language takes the language key as an argument and is built on `AppConfig` (`termsUrl(lang)`, `privacyUrl(lang)`), never assembled inline in a screen. Get the current key via `getActiveLanguage().key`.

## RTL behaviour

- `typography.*` automatically sets `textAlign: "right"` for Arabic and `direction: "ltr"` for numeric / mixed content. Don't override unless you explicitly need LTR (phone input, URLs).
- For layout, use logical edges:
  - `marginStart` / `marginEnd` over `marginLeft` / `marginRight`
  - `paddingStart` / `paddingEnd` over `paddingLeft` / `paddingRight`
  - `start` / `end` over `left` / `right` for absolute positioning
- Branch on direction with `getDirection() === "rtl"`.

## Language switching

`setActiveLanguage("en" | "ar")` persists the choice, re-mounts the downstream providers (fonts, theme) and invalidates the React Query cache (`useDefaultQueryKey` includes the language key) — no manual refetch. **A runtime switch must also `reset()` to root**, or the UI freezes half-switched: see the Project traps section in [`general.md`](general.md).
