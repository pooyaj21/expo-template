---
description: "Bottom-sheet dialog patterns and the DialogManager"
globs: src/features/core/dialogs/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/features/core/dialogs/**/*.{ts,tsx}"
---

# Dialogs — `src/features/core/dialogs/**/*.{ts,tsx}`

All dialogs in this app are bottom sheets. Build them on top of `AppBaseBottomSheetDialog` (`@/common/presentation/components/app/AppBaseBottomSheetDialog`).

The base ships two, both shared: `LanguageSelectBottomSheetDialog` and `TextDetailBottomSheetDialog`.

## How to mount a dialog — pick by reach + whether it fetches

> **Hard rule: any dialog whose body makes a network call — directly or through a hook (`useQuery`, `use*Query`, `use*UseCase`) — MUST be mounted lazily** (via `DialogManagerContext` or `useLazyBottomSheet`). Eager ref-mounting such a dialog is a bug: it mounts with the host screen, so its request fires before the user ever opens it. Lazy mounting only runs the body — and its hooks — after `present()`.

Three mounting options:

1. **Shared across screens** (presented from more than one screen, or generic enough that any screen could present it — `language`, `textDetail`): register in `DialogManagerContext`. Lives in `src/features/core/dialogs/`. The manager hosts it lazily for you.
2. **Screen-local AND fetches data**: mount lazily with `useLazyBottomSheet` (`@/common/business-logic/hooks/useLazyBottomSheet`). Render the returned `.node` in the screen and open it via the returned `present()`. **Never** eager-mount it with a plain `useRef<BottomSheetModal>`. Do NOT register it in `DialogManagerContext` and do NOT put it in `src/features/core/dialogs/` — colocate it next to its owning screen.
3. **Screen-local AND no data fetch** (static content, or data passed in via props): a plain `useRef<BottomSheetModal>` driven by `ref.current?.present()` / `ref.current?.dismiss()` is fine. Colocate it next to its owning screen, not in `src/features/core/dialogs/`. These dismiss themselves (cancel / back / backdrop) and expose only outcome callbacks (`onConfirm`, `onDismiss`) — no `onClose` prop.

Registering a single-caller sheet in the manager costs every screen in the app a context entry, and the manager mounts it above the whole tree, so it cannot read anything from the screen that owns it. `useLazyBottomSheet` is the shared lazy-mount primitive; `DialogManagerContext` uses it internally. Both unmount the dialog after dismissal, so the body re-runs fresh next time.

### Screen-local lazy dialog (option 2)

```tsx
const pickerDialog = useLazyBottomSheet<PickerProps>(
  ({ ref, options, onDismiss }) => (
    <PickerBottomSheetDialog ref={ref} {...options} onDismiss={onDismiss} />
  ),
);

// open it (options captured at present-time)
pickerDialog.present({ selectedId: value, onApply: onSelect });

// render its lazily-mounted node once in the screen tree
{
  pickerDialog.node;
}
```

## File layout

- One file per dialog in `src/features/core/dialogs/`.
- File + component: PascalCase, suffixed `BottomSheetDialog` (`FooBottomSheetDialog.tsx`), with a `displayName`.
- The host context lives at `src/common/presentation/providers/DialogManagerContext.tsx`. Add new shared dialogs there — never spin up a second `*DialogProvider`.

## Dialog component skeleton

- `forwardRef<BottomSheetModal, Props>` so the host can call `present()` / `dismiss()`.
- Compose `AppBaseBottomSheetDialog` — never render `BottomSheetModal` directly. Use its slots: `title` / `header`, `contentContainerStyle`, `footer`.
- **Action buttons (Apply / Confirm / Cancel) go at the bottom of the content**, as the last children inside `contentContainerStyle` — like `TextDetailBottomSheetDialog`. Do **not** use the `footer` slot to pin them; the sheet is content-sized, so buttons placed last in the content already sit at the bottom.
- Default to dynamic sizing (don't pass `snapPoints` unless the design needs fixed heights). The base sheet auto-resizes when children change, and pads itself against the top safe area.
- All visible strings come from props (already localized by the caller) or from `getString` inside the dialog — never hard-code copy a caller might want to override. Proper nouns are the exception: the language picker renders endonyms (`العربية`, `English`) and must never localize them.
- Use theme tokens (`useAppTheme`) for colors / typography. No hex literals. Reserve the bottom inset with `useSafeAreaInsets()` from `react-native-safe-area-context`.
- Wrap interactive rows in `AppPressable` (with `enableAnimation`), and give them an `accessibilityRole` + `accessibilityLabel`.
- **Manager-registered dialogs only:** accept and forward BOTH `onClose` and `onDismiss` to `AppBaseBottomSheetDialog`. (Local-ref dialogs skip `onClose` and dismiss themselves via the forwarded ref.) The manager wires them differently:
  - `onClose` → request to close (triggers the dismissal animation). Call this from in-body actions like "user picked an option".
  - `onDismiss` → fires after the sheet is fully closed; the manager uses it to unmount the dialog and run the caller's `onClose`.

```tsx
export type FooProps = {
  onClose?: () => void;
  onDismiss?: () => void;
  // ...other options
};

export const FooBottomSheetDialog = forwardRef<BottomSheetModal, FooProps>(
  function FooBottomSheetDialog(props, ref) {
    const { title, items = [], onClose, onDismiss } = props;
    return (
      <AppBaseBottomSheetDialog
        ref={ref}
        title={title}
        onClose={onClose}
        onDismiss={onDismiss}
      >
        {/* body, then the action buttons as the last children */}
      </AppBaseBottomSheetDialog>
    );
  },
);
```

## Scrolling inside a sheet (hard rule)

A plain React Native `ScrollView` inside a gorhom sheet is **dead on Android** — the sheet's pan gesture wins every touch and the body never scrolls.

- **The whole body scrolls** → pass `scrollable` on `AppBaseBottomSheetDialog`. It renders a single `BottomSheetScrollView` root with the header as a sticky first child, which keeps dynamic sizing accurate and stops the body painting over the title (`TextDetailBottomSheetDialog` is the reference).
- **An inner region scrolls** beside pinned content → set `enableContentPanningGesture={false}` on the sheet so the inner scrollable gets the gesture; the handle stays the drag surface. An `AppList` in that sheet then falls back to the native scroll path on purpose.

Full write-up in [`.ai/rules/conventions.md`](../../.ai/rules/general.md "Project traps section").

## Text inputs inside sheets — keyboard handling (hard rule)

Any text input rendered inside a bottom sheet (`AppTextInput`, `AppPinCode`, or anything built on them) **MUST pass `bottomSheet`** so it renders `BottomSheetTextInput`. A plain `TextInput` is invisible to the sheet's keyboard tracking, so the keyboard opens **over** the sheet and covers the field.

```tsx
<AppBaseBottomSheetDialog>
  <AppTextInput bottomSheet placeholder={…} value={…} onChangeText={…} />
</AppBaseBottomSheetDialog>
```

`AppBaseBottomSheetDialog` already defaults `keyboardBehavior="interactive"`, `keyboardBlurBehavior="restore"` and `android_keyboardInputMode="adjustPan"` — do not re-declare them per dialog, and **never** set `android_keyboardInputMode="adjustResize"`: the app is edge-to-edge, so Android never resizes the window for the IME, and `adjustResize` makes the sheet skip its own shift and sit under the keyboard.

Checklist every time an input goes into a dialog: `bottomSheet` on **every** input in the sheet. Also remember the sheet portals its children above `DialogManagerProvider` — a component inside a sheet cannot open a managed dialog, so pass the action down from the dialog's own body (`useDialogManagerOptional()` exists for code that may render in either place and must not throw).

## Registering in `DialogManagerContext`

The manager mounts dialogs lazily via `useLazyBottomSheet` so any hooks inside the dialog body only fire once `present()` is called, and the dialog unmounts after dismissal. Add new dialogs by passing a render function — never re-introduce a controller that always renders its `node`.

```tsx
const foo = useLazyBottomSheet<FooProps>(
  ({ ref, options, onClose, onDismiss }) => (
    <FooBottomSheetDialog
      ref={ref}
      {...options}
      onClose={onClose}
      onDismiss={onDismiss}
    />
  ),
);

const value = useMemo<DialogManagerContextType>(
  () => ({
    foo: { present: foo.present, dismiss: foo.dismiss } /* ...others */,
  }),
  [foo.present, foo.dismiss],
);

return (
  <DialogManagerContext.Provider value={value}>
    {children}
    {foo.node}
    {/* other.node */}
  </DialogManagerContext.Provider>
);
```

And add the entry to `DialogManagerContextType`:

```tsx
type DialogManagerContextType = {
  foo: DialogApi<FooProps>;
};
```

## Calling from screens

Use the hook — never import a shared dialog component into a screen.

```tsx
const dialogs = useDialogManager();
dialogs.textDetail.present({ title, text, confirmedButton });
dialogs.textDetail.dismiss();
```

## Dialog don'ts

- ❌ Registering a single-caller dialog in the manager, or parking it in `src/features/core/dialogs/`.
- ❌ Eager-mounting a data-fetching dialog with a screen-level `useRef<BottomSheetModal>` — its request fires on screen mount.
- ❌ A separate provider per dialog — extend `DialogManagerContext` instead.
- ❌ `enableDynamicSizing={false}` unless the design requires fixed snap points; default behaviour is content-driven height.
- ❌ Bypassing `AppBaseBottomSheetDialog` (it owns backdrop, hardware back, dismissal flow, theming, safe area, keyboard mode).
- ❌ Using the `footer` slot for action buttons — place them at the bottom of the content.
- ❌ A plain `ScrollView` inside a sheet, or a text input without `bottomSheet`.
