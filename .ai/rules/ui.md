---
description: "Components, theming, fonts, RTL, lists, and styling"
globs: src/{components,screens,skeleton}/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/{components,screens,skeleton}/**/*.{ts,tsx}"
---

# UI & Theming — `src/{components,screens,skeleton}/**/*.{ts,tsx}`

This file also applies to siblings `src/features/` and `src/common/presentation/components/`.

## Components

Three buckets in `src/common/presentation/components/`:

- **`src/app/`** — branded, app-wide primitives. Prefix with `App` (`AppText`, `AppButton`, `AppTextInput`, `AppToolbar`, `AppToolbarButton`, `AppPressable`, `AppImage`, `AppList`, `AppSelectionRow`, `AppToast`, `AppBaseBottomSheetDialog`). The building blocks of screens.
- **`cell/<domain>/`** — list/grid item components, one subfolder per entity (`example/ExampleCell.tsx`). A cell takes the entity as a prop and nothing else. **Empty in the base** — the first real feature fills it.
- **`general/`** — unbranded primitives (`Loading`, `Error`, `Spacer`, `PageContainer`, `StateHandler`, `CTouchable`, `IconView`, `AutoSizeText`, `Toolbar`, `DashedLine`, `HorizontalFlatList`, `HorizontalScrollView`, `HorizontalPagerView`, `ScreenFreeze`, `AppErrorBoundary`, `CrashFallback`, `InternalError`). May be lifted into a design system later.

### Rules

- Functional components with typed props. Props type named `<Component>Props`, declared directly above the component.
- For touchables use `AppPressable` (press scale + throttle, on top of `CTouchable`). Never call `<Pressable>` or `<TouchableOpacity>` directly in a screen.
- **No dim on press.** `CTouchable` / `AppPressable` do not change opacity while held. The only visual press state is the opt-in scale on `AppPressable` (`enableAnimation`) — never pass that in a recycled list cell, and never invert it into an opt-out: a default-on Reanimated node in every recycled `FlashList` cell is what makes lists flash blank mid-fling (see List rendering). **Never add `android_ripple`** — Material ripple was tried and rejected.
- **A button in a toolbar is `AppToolbarButton`**, never a bare `AppPressable` — including the `startIcon` / `actions` a screen hands to `AppToolbar`. It owns the 40x40 / radius-12 container (so every toolbar matches) and the selection haptic (so none is forgotten); pass `accentColor` on a tinted toolbar, and `style` only for a different background. The back arrow is the deliberate exception: `AppBackIcon` fires **no** haptic, because back is pressed constantly and a tick on every one is noise.
- Haptics go through `haptics` from `@/common/business-logic/utils/haptics` — never import `expo-haptics` in a component. On iOS the wrapper maps to the Taptic selection / impact / notification APIs. On Android (expo-haptics 55.x) it never calls `performAndroidHapticsAsync`, which can no-op off the main thread ([expo/expo#49262](https://github.com/expo/expo/issues/49262)), nor `notificationAsync`, which many devices render as nothing or a long buzz — `success` / `warning` / `error` map to `impactAsync` there. It swallows the rejection a device with no haptic engine throws, and `setHapticsEnabled` is a dev kill switch, not a Settings toggle. **Call sites in the base:** `selection` — `AppTabBar` (only when the tab actually changes), `AppChipTabs` (only when a different chip is picked), `AppToolbarButton`; `toggleOn` / `toggleOff` — `AppSwitch` only. **`AppBackIcon` and generic `AppPressable` stay silent** — haptics are not automatic per press. The other effects exist for product call sites, and the patterns are: `selection` on each step of a quantity stepper; `success` once when a payment result screen first resolves to paid (a ref reset per payment reference stops a refetch re-firing it); `light` / `medium` for a sheet snap; `error` for a validation failure. Never fire a cart `success` from a use case while the stepper already ticks `selection` on each +.
- For text use `AppText` — its props are a discriminated pair: either `variant` (a named style) **or** `weight` + `size`, never both, because a named variant already carries its own family, size and spacing.
- For text buttons use `AppButton` with `buttonType` (`"contained" | "outlined" | "text"`) and `buttonStyle` (`"primary" | "secondary"`). It takes either manual props (`title` + `onPress`) or a backend `ButtonInterface` via `response` — a discriminated union narrowed with the `"key" in props` idiom (`const isResponse = "response" in props;`), which is the pattern to copy for any variant prop shape.
- Accept a `style?: StyleProp<ViewStyle>` escape hatch on any layout component.
- Never hard-code a user-facing string — every label, placeholder and a11y label comes from `getString` (see the root `.ai/rules/`).

## Styling

- **Inline single-use styles, hoist reused styles.** A style object that appears at exactly one JSX site stays inline at that site. The moment a style is used at 2+ sites, lift it into a `getStyles(theme)` factory keyed by name. This keeps the `StyleSheet` lean and makes "this is shared" visible at a glance.
- For inline styles that mix theme tokens with ad-hoc values, use the array form: `style={[typography.regular[13], { color: colors.text.primary }]}`.
- Colocate the factory at the bottom of the file, return `StyleSheet.create({...})`, and memoize with `useMemo(() => getStyles(theme), [theme])` if the component re-renders often. If the component has zero reused styles, skip the factory and `StyleSheet` entirely — every style is inline.

```tsx
// ✅ GOOD — `tile` is reused per row, so it lives in StyleSheet.
//          The one-off container styles stay inline.
const Picker = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  return (
    <View style={{ paddingHorizontal: 20, paddingBottom: 24, gap: 8 }}>
      {items.map((item) => (
        <View key={item.key} style={styles.tile}>
          …
        </View>
      ))}
    </View>
  );
};

const getStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    tile: { padding: 16, borderRadius: 12, borderColor: colors.border.light },
  });

// ❌ BAD — `container` and `content` are used once each, no need to hoist.
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
});
```

## List rendering

- Use `AppList` (`components/app/AppList.tsx`) for lists — it wraps `@shopify/flash-list` and takes the full `FlashListProps` API. Do not use `FlatList`, do not render a long list inside a `ScrollView`, and do not reach for a bare `FlashList` unless you need a prop `AppList` owns.
- `AppList` measures itself and sets `drawDistance` to two viewport heights (falling back to window height before the first layout). The FlashList default is 250px, less than one screen: a fast fling outruns the renderer and the list flashes white until the cells catch up.
- Blank cells also come from rows FlashList has to measure. Give list rows a **fixed height** (`AppSelectionRow` does, via `SELECTION_ROW_HEIGHT`). If a list mixes row shapes, add `getItemType` so each shape gets its own recycle pool.
- Keep list rows free of Reanimated. `AppPressable` only mounts the scale animation when you pass `enableAnimation`; without it `CTouchable` renders a plain `Pressable`. An animated node per recycled cell inflates FlashList's `averageRenderTime`, which is the multiplier on its render-window overshoot — so never pass `enableAnimation` to a row inside a long list.
- Inside a bottom sheet pass `inBottomSheet` — `AppList` then wires gorhom's scrollable creator, but **only when the sheet still has `enableContentPanningGesture` on** (it reads that off `useBottomSheetInternal(true)`; nothing to pass). A fixed-height picker sheet should set `enableContentPanningGesture={false}` and let `AppList` fall back to the native scroll path.
- Infinite lists pass `pagination={pagination}` — the `InfiniteListPagination` a use case returns — and `AppList` owns `onEndReached`, the `0.5` threshold and the bottom loader. Never hand-wire `onEndReached` + `ListFooterComponent` for pagination in a screen.
- `showSeparator` draws the standard `colors.divider` hairline between rows. Picker rows use `AppSelectionRow` (fixed height, optional image, title + subtitle, `SelectionAccessoryEnums.RADIO | CHEVRON | NONE`) before you hand-roll another selectable row.
- A horizontal list in RTL already opens on its right edge — never "fix" that with an on-mount scroll, and never move one through a raw `ScrollView` ref: `scrollTo({ x: 0 })` is the left edge, which in RTL is the _end_. Type the ref as `HorizontalScrollViewRef` and call `scrollToStart()` / `scrollToEnd()`.
- For async/remote data, wrap the list in `<StateHandler data error isLoading isEmpty retry>` — it renders loading / error / empty uniformly, with `emptyComponent` for a custom `AppEmptyState`.

## Theming

Access the theme inside components:

```tsx
import {
  AppTheme,
  useAppTheme,
} from "@/common/presentation/providers/ThemeContext";
const { colors, typography, fonts, dark } = useAppTheme();
```

### Colors

**NEVER** hard-code hex values in components. Use the semantic token:

- Text: `colors.text.primary | secondary | disabled | placeholder | contrast`
- Brand: `colors.primary.main | dark | light | contrast` and the shade ramp `colors.primary[0..900]` (same for `secondary`, plus `colors.grey[...]`)
- Status: `colors.error | warning | info | success` (each has `main | dark | light | contrast`)
- Surface: `colors.background.main | level1 | level2 | white`
- `colors.border.light | default | dark`, `colors.divider`, `colors.white`, `colors.black`
- Buttons: `colors.button.primary.{main,hover,focus,disabled}` and `.secondary`

For translucency use `withAlpha(color, 0.5)`; `mixColors(from, to, ratio)` and `PLATFORM_SHADOW` live in the same file (`@/common/presentation/theme/AppColor`). The base's ramps are deliberately neutral placeholders — rebranding a project means editing `AppColor.ts`, never patching hexes into components.

### Typography

Two shapes:

1. **Size-based** (preferred for body/UI text): `typography.<weight>[size]` where weight ∈ `light | regular | medium | semiBold | bold` and size ∈ `10, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 40`. A Proxy tolerates other sizes but returns them without a line height — prefer the canonical steps.

```tsx
<AppText weight={AppTextWeightEnums.BOLD} size={20}>…</AppText>
<Text style={[typography.regular[14], { color: colors.text.secondary }]}>body</Text>
```

2. **Custom named styles**: `typography.custom.{h1..h6, subtitle1, subtitle2, body1, body2, caption, overline}`, reached through `AppText`'s `variant`.

### Fonts

Do not import font files or hard-code family names. `AppThemeProvider` loads every file named in `FontFiles` (`src/common/presentation/theme/AppFont.ts`) and `typography.*` resolves the right family per locale. The base ships **no font files** — every slot falls back to the platform system face, and branding a project is three edits in `AppFont.ts` and nothing else.

### RTL

`typography.*` sets `writingDirection` per locale and the theme aligns Arabic text to the right. Don't override `textAlign` unless intentional (phone input, URLs). For horizontal layouts use `flexDirection: "row"` and let RN mirror it; use `marginStart / marginEnd / paddingStart / paddingEnd` and `start / end`, never the `Left` / `Right` variants.

### Spacing

- Multiples of 4 (`4, 8, 12, 16, 20, 24, 32`) for padding, margin, gap.
- Prefer `gap` on flex containers over sibling margins. A zero-size/invisible child still consumes a slot in a parent with `gap` — give an element that must stay mounted but out of layout `position: "absolute"` rather than zeroed dimensions.
- Screen-level horizontal padding is 16 or 20 — match surrounding screens.
- Screen-level safe-area padding goes through `useAppSafeAreaInsets()` (`PageContainer` already does). On Android it floors `bottom` at `max(insets.bottom, initialWindowMetrics.bottom, 34)` so flaky / 3-button nav-bar reporting does not collapse under CTAs. Prefer the hook for bottom-padded screens; raw `useSafeAreaInsets()` remains fine for top-only or non-flooring reads. Under the tab bar use `useAppNavigationBarDimension()` instead: the bar floats over the content.

## Two traps worth knowing before you write the component

- A **collapsible header must overlay the list** (absolute position + a constant top inset on the list), never sit in its flow — an in-flow shrinking header moves the content at double speed and the collapse can never settle. Drive it with `useCollapsibleHeader`.
- A **centered single-line shrink-to-fit `Text` clips its last word on Android** unless it gets `alignSelf: "stretch"` + `textAlign: "center"` — use `AutoSizeText`.

Both, with the full symptom / cause / fix, are in [`.ai/rules/conventions.md`](../../.ai/rules/general.md "Project traps section").
