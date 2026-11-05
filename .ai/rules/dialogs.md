---
description: "Bottom-sheet dialog patterns and the DialogManager"
globs: src/features/core/dialogs/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/features/core/dialogs/**/*.{ts,tsx}"
---

# Dialogs

All dialogs in this app are bottom sheets. Build them on top of `AppBaseBottomSheetDialog`.

## How to mount a dialog — pick by reach + whether it fetches

> **Hard rule: any dialog whose body makes a network call — directly or through a hook (`useQuery`, `use*Query`, `use*`) — MUST be mounted lazily** (via `DialogManagerProvider` / `useDialogManager`, or a lazy-mount helper). Eager ref-mounting such a dialog is a bug: it mounts with the host screen, so its request fires before the user ever opens it.

Three mounting options:

1. **Shared across screens** — register in `DialogManagerProvider` / `useDialogManager`. Lives under `src/features/core/dialogs/`.
2. **Screen-local AND fetches data** — mount lazily with the project's lazy-bottom-sheet helper. Colocate next to the owning page. Do NOT register it in the global manager.
3. **Screen-local AND no data fetch** — a plain `useRef<BottomSheetModal>` is fine. Colocate next to the owning page.

## File layout

- Shared dialogs: `src/features/core/dialogs/presentation/`.
- File + component: PascalCase, suffix with `BottomSheetDialog` (`FooBottomSheetDialog.tsx`).
- Manager: `useDialogManager.ts` + `DialogManagerProvider.tsx`. Add new shared dialogs there — never spin up a new `*DialogProvider`.

## Dialog component skeleton

- `forwardRef<BottomSheetModal, Props>` so the manager can call `present()` / `dismiss()`.
- Compose `AppBaseBottomSheetDialog` — never render `BottomSheetModal` directly.
- Action buttons go at the bottom of the content (last children), not a pinned `footer` slot, unless the base component documents otherwise.
- Default to dynamic sizing (don't pass `snapPoints` unless the design needs fixed heights).
- All visible strings come from localization / props; never hard-code copy.
- Use theme tokens (`useAppTheme`) for colors / typography. No hex literals.
- Manager-registered dialogs accept and forward `onClose` and `onDismiss` as the base sheet requires.

## Text inputs inside sheets

Any text input inside a bottom sheet **MUST** use the bottom-sheet-aware input path (e.g. `AppTextInput` with a `bottomSheet` prop) so the keyboard does not cover the field.

## Calling from screens

```tsx
const dialogs = useDialogManager();
dialogs.confirm.present({ message: "...", onConfirm: handleConfirm });
dialogs.date.present({
  title: "...",
  selectedDate: "2026-01-15",
  onApply: (iso) => {},
});
dialogs.date.dismiss();
```

Shared date picker: `AppDateBottomSheetDialog` — localized month/day names (en/ar), RTL-aware chevrons, ISO `YYYY-MM-DD` apply value. Registered as `dialogs.date`.

Never import the shared dialog component into a screen.

## Don'ts

- Do not eager-mount a data-fetching dialog with a screen-level `useRef`.
- Do not create a separate provider per dialog.
- Do not bypass `AppBaseBottomSheetDialog`.
- Do not render a text input inside a sheet without the bottom-sheet input mode.
