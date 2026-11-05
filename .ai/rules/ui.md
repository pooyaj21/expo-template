---
description: "Components, theming, fonts, RTL, lists, and styling"
globs: src/common/presentation/**/*.{ts,tsx},src/features/**/presentation/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/common/presentation/**/*.{ts,tsx}"
  - "src/features/**/presentation/**/*.{ts,tsx}"
---

# UI & Theming

## Components

Shared primitives live in `src/common/presentation/components/` and are prefixed `App` when they are branded building blocks (`AppButton`, `AppText`, `AppTextInput`, `AppToolbar`, `AppPressable`, `AppImage`, `AppList`, `AppToast`, …). Unprefixed names are fine for general helpers (`Loading`, `Spacer`, `PageContainer`, `StateHandler`, `Skeleton`).

Feature-specific UI stays under `src/features/<feature>/presentation/`.

**Every new component and page ships with `testID`s** — forward an optional `testID` prop; pages tag their root, pressables, inputs, list items and asserted text. Prefer a shared catalog helper when one exists. Full rule: `.ai/rules/testing.md`.

### Skeleton

- Functional components with typed props (`<Component>Props` above the component).
- Named arrow-function exports.
- For touchables use `AppPressable`. Never call `<Pressable>` / `<TouchableOpacity>` directly in a feature screen.
- No dim on press; no `android_ripple`.
- For text buttons use `AppButton` with the project's `buttonType` / `buttonStyle` props.
- Accept a `style?: ViewStyle` (or `StyleProp<ViewStyle>`) escape hatch on layout components.

## Styling

- Plain React Native `StyleSheet` — no styled-components / NativeWind unless already present.
- **Inline single-use styles, hoist reused styles.** A style used at exactly one JSX site stays inline. Used at 2+ sites → lift into a `getStyles(theme)` factory returning `StyleSheet.create({…})` at the bottom of the file.
- For inline styles that mix theme tokens with ad-hoc values, use the array form: `style={[typography.regular[13], { color: colors.text.primary }]}`.

## List rendering

- Use `AppList` for vertical lists (FlashList wrapper). Do not use `FlatList` for long lists.
- Prefer fixed row heights / `getItemType` when shapes differ.
- Infinite lists pass pagination props the list component owns — don't hand-wire `onEndReached` + footer loaders in every screen.
- For async/remote data, wrap the list in `<StateHandler data error isLoading retry>`.

## Theming

```tsx
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
const { colors, typography, fonts, isDark } = useAppTheme();
```

Tokens live in `src/common/presentation/token/` (`colors.ts` light/dark, `typography.ts`, `fonts.ts`, `dimensions.ts`). Theme provider is `common/presentation/providers/AppThemeProvider`.

**NEVER** hard-code hex values in components — use semantic tokens (`colors.text.primary`, `colors.primary.main`, `colors.background.*`, …).

### Fonts

Do not import font files or hard-code family names in screens. `AppThemeProvider` loads the per-language map (en: Inter, ar: IBM Plex Sans Arabic). Use `typography.*` exclusively.

### RTL

- Prefer logical edges: `marginStart` / `marginEnd` / `paddingStart` / `paddingEnd` / `start` / `end`.
- Use `flexDirection: "row"` and let RN mirror it; don't flip with conditionals unless intentional.
- Branch on direction with `getDirection() === "rtl"` from localization when needed.
- A root `direction` style follows the active language.

### Spacing

- Multiples of 4 for padding, margin, gap.
- Prefer `gap` on flex containers over sibling margins.
- Screen-level horizontal padding is typically 16 or 20 — match surrounding screens.
