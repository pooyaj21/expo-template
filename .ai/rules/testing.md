---
description: "Testing — testIDs required on every new component and page, what the Maestro E2E suite covers today, how to write a new flow and its testIDs, and the 'suggest a flow' step after every feature"
globs: .maestro/**,src/common/business-logic/testIds.ts
alwaysApply: false
paths:
  - ".maestro/**"
  - "src/common/business-logic/testIds.ts"
---

# Testing (Maestro E2E)

The only automated test layer is **Maestro UI flows** in `.maestro/`, run against
the dev build on an iOS simulator / Android emulator. There are **no Jest / unit /
component tests** in the repo — verification otherwise is `npm run type:check` +
`npm run lint` / `rn-verify` and a manual device run.

- How to run, env vars, subflows, gotchas: `.maestro/README.md`.
- The **flow inventory** lives in `.maestro/README.md` → "Flow inventory". Update
  it in the same change as the flow.

## What is covered today

| Tag     | Covered                             |
| ------- | ----------------------------------- |
| `smoke` | Launch → home → example list → back |

## Not covered (no flow yet)

Example detail, language picker, settings, deep links, tablet layout, debug menu.
Pick from this list when suggesting new flows, and remove an item once it has one.

## Every new component and page ships with `testID`s

`testID`s are added **when the component or page is created**, not later when
someone writes a flow.

1. **New reusable component** (`src/common/presentation/components/`, feature
   `presentation/components/`, `src/features/core/dialogs/`): accept optional
   `testID?: string` and forward it to the root. Multi-tappable cells take an
   entity id and build part ids with a helper (`exampleCellTestId(id)`).
2. **New page / screen**: give a `testID` to the screen root or main list, every
   pressable, every input, every list item (`<prefix>-<backendId>`), and every
   `Text` a flow asserts.
3. **New bottom sheet / dialog**: confirm / cancel / close reuse `DIALOG_CONFIRM`
   / `DIALOG_CANCEL` / `DIALOG_CLOSE`; feature actions get their own member.
4. Ids come from `src/common/business-logic/testIds.ts` only: `TestIdEnums` or a
   helper on `testIdFor`. Never a raw string literal in the component.
5. Ids are language- and data-independent — never from copy or display names.

```tsx
// ❌ BAD
<AppButton testID={`btn-${getString("shared_seeAll")}`} … />

// ✅ GOOD
<AppPressable testID={TestIdEnums.HOME_EXAMPLE_LIST} … />
<AppPressable testID={exampleCellTestId(item.id)} … />
```

## Rules for a new flow

1. **Select by `testID` only** — suite must pass in `en` and `ar`.
2. Every id from `src/common/business-logic/testIds.ts` — no raw `testID="…"` in components.
3. List items: tight regex + `index: 0` (`id: "example-cell-\\d+"`).
4. **Never tap an irreversible or paying action.** Stop before it; document in
   README → "Safety rules".
5. Guard optional server state with `runFlow: when:`.
6. Reuse subflows (`freshLaunchToHome`, `dismissLogBox`).
7. File layout: `.maestro/flows/<tag>/NN_<camelCase>.yaml`,
   `appId: com.pj21.apptemplate`, a `name:` like `"Feature: a -> b -> c"`, and a
   documented tag.
8. Wait with `extendedWaitUntil` on the next screen's id — not fixed sleeps.
9. Credentials only via `-e TEST_EMAIL / TEST_PASSWORD`. Never commit them.
10. Run the new flow on **both** iOS and Android before calling it done.

## After every feature: suggest a flow

When a feature, screen or user-visible change is finished, **suggest** — do not
silently write — a Maestro flow for it:

1. Name the happy path in one line, the tag and the file path.
2. List the `testID`s it needs that don't exist yet in `testIds.ts`.
3. Say which step it must stop before (rule 4) and what server side effects it leaves.
4. Write it only if the user says yes; then update the README inventory and the
   "Not covered" list above.
