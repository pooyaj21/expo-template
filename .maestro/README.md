# Maestro E2E

Maestro UI flows for this Expo template on the iOS simulator / Android emulator.
Selectors are language-independent: every target is a `testID` from
`src/common/business-logic/testIds.ts` (`TestIdEnums` + helpers). Flows never
select by visible text or backend display names, so the same suite runs in
English and Arabic.

## Prerequisites

- Maestro CLI installed
- A booted simulator / emulator with the **dev build** installed
  (`appId` / bundle id `com.pj21.apptemplate` — replace when you rebrand)
- Metro running (`npx expo start`) — this is a dev-client build

## Run

```bash
# All flows
maestro test .maestro

# One group
maestro test .maestro/flows/smoke

# By tag
maestro test .maestro --include-tags smoke
```

Tags: `smoke`.

## Flow inventory

### `flows/smoke`

| File                 | `name:`                                    |
| -------------------- | ------------------------------------------ |
| `01_shellSmoke.yaml` | Smoke: launch → home → example list → back |

## Subflows

| File                     | Role                                         |
| ------------------------ | -------------------------------------------- |
| `freshLaunchToHome.yaml` | Clean install launch straight to home        |
| `dismissLogBox.yaml`     | Dismisses the RN LogBox overlay when present |

## Safety rules

Flows **never** tap irreversible actions (account delete confirm, real payments,
anything that charges or sends). Stop on the screen before that step.

## Writing new flows

1. Select by `testID` only — ids from `src/common/business-logic/testIds.ts`.
2. File layout: `.maestro/flows/<tag>/NN_<camelCase>.yaml`, `appId: com.pj21.apptemplate`.
3. Wait with `extendedWaitUntil` on the next screen's id after navigation.
4. Reuse subflows instead of copying steps.
