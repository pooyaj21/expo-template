---
description: "Testing — Maestro smoke only, testIDs required on every new component and page (no Jest)"
globs: .maestro/**
alwaysApply: false
paths:
  - ".maestro/**"
---

# Testing (Maestro E2E)

The only automated test layer is **Maestro UI flows** in `.maestro/`, run against the dev build on an iOS simulator / Android emulator. There are **no Jest / unit / component tests** in the repo — verification otherwise is the `verify` skill (`type:check` + `lint` + rule audit) and a manual device run.

- App id: `com.pj21.apptemplate`
- How to run: install Maestro, boot a simulator/emulator with the dev client, then `maestro test .maestro/flows/smoke/`.

## What is covered today

| Tag     | Covered                               |
| ------- | ------------------------------------- |
| `smoke` | App launches; example list is visible |

## Every new component and page ships with `testID`s

`testID`s are added **when the component or page is created**, not later when someone writes a flow.

1. **New reusable component**: accept an optional `testID?: string` prop and forward it to the root element.
2. **New page**: give a `testID` to the screen root / main list, every pressable, every input, list items, and asserted text.
3. Ids are language- and data-independent: never derived from copy or a backend display name.

```tsx
// BAD
<AppButton testID={`btn-${getString("example_open")}`} … />

// GOOD
<AppButton testID="example-open" … />
<AppList testID="example-list" … />
```

Prefer a shared `TestIdEnums` / helper module under `common/business-logic` when one exists; until then, stable kebab-case string constants colocated with the feature are acceptable — never inline random strings at every call site.

## Rules for a new flow

1. **Select by `testID` only** — never by visible text. The suite must pass in `en` and `ar`.
2. File layout: `.maestro/flows/<tag>/NN_<camelCase>.yaml`, `appId: com.pj21.apptemplate`, a `name:`, and a tag.
3. Wait with `extendedWaitUntil` (+ `timeout`) on the next screen's id after navigation — not fixed sleeps.
4. Never tap an irreversible or paying action.
5. Run the new flow on **both** iOS and Android before calling it done.

## After every feature: suggest a flow

When a feature or user-visible change is finished, **suggest** — do not silently write — a Maestro flow for it. Write it only if the user says yes.
