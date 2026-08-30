# presentation — `src/**/presentation/**`

Screens and components. It may import `business-logic` and `common/presentation`;
it must **not** import `data-access` directly — take types and state from a
business-logic hook. ESLint enforces the import rule.

## Where a component goes

- **`common/presentation/components/`** — unbranded primitives: `Loading`,
  `ErrorView`, `StateHandler`, `Spacer`, `PageContainer`, `CTouchable`,
  `AppErrorBoundary`.
- **`common/presentation/components/app/`** — branded, app-wide primitives,
  `App`-prefixed: `AppButton`, `AppText`, `AppTextInput`, `AppPressable`,
  `AppToolbar`, `AppImage`. These are the building blocks screens compose.
- **`features/<feature>/presentation/components/`** — anything only that feature
  uses. A list item is `<Entity>Cell.tsx` and takes the entity as one prop.

Every screen starts with `PageContainer` and, for remote data, wraps content in
`StateHandler` so loading / error / empty / content look the same everywhere.

## Component rules

- Functional components, typed props declared directly above as
  `<Component>Props`.
- Touchables go through `AppPressable` (press feedback) or `CTouchable`
  (throttling). Never `Pressable` or `TouchableOpacity` in a screen — a
  double-tap on submit creates duplicate writes.
- Text goes through `AppText` (or `typography.*` explicitly). Never a bare
  `<Text>` with a hand-written `fontFamily`.
- Accept a `style?: StyleProp<ViewStyle>` escape hatch on layout components.
- Buttons show progress with `isLoading`, never by swapping the label.

## Styling

**Inline single-use styles, hoist reused styles.** A style object used at exactly
one JSX site stays inline. The moment it is used twice, lift it into a
`StyleSheet.create` at the bottom of the file — that makes "this is shared"
visible at a glance and keeps the sheet small.

For styles mixing theme tokens with ad-hoc values, use the array form:

```tsx
<Text style={[typography.regular[13], { color: colors.text.primary }]} />
```

If a style depends on the theme, build it in a `getStyles(theme)` factory at the
bottom of the file and memoize with `useMemo(() => getStyles(theme), [theme])`.

## Theming

```tsx
const { colors, typography, fonts, isRtl } = useAppTheme();
```

**Never hard-code a hex.** Use the semantic token:

- Text — `colors.text.primary | secondary | disabled | placeholder | contrast`
- Brand — `colors.primary.main | dark | light | contrast`, ramp `colors.primary[50..900]`
- Status — `colors.error | warning | info | success` (each `main | dark | light | contrast`)
- Surface — `colors.background.main | level1 | level2 | white`
- Lines — `colors.border.light | default | dark`, `colors.divider`
- Buttons — `colors.button.primary.{main,hover,focus,disabled}` and `.secondary`

Translucency: `withAlpha(colors.primary.main, 0.4)`. Raw hex is for prototyping
only — replace before merging.

### Typography

Two shapes:

1. **Size-based** (default): `typography.<weight>[size]`, weight ∈
   `light | regular | medium | semiBold | bold`, size ∈
   `10, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 40`. Off-ramp sizes still work
   (a Proxy fills them in) but prefer the canonical ones.
2. **Named**: `typography.custom.{h1..h6, subtitle1, subtitle2, body1, body2,
caption, overline}` for design-system headings.

Never import a font file or write a family name — `AppThemeProvider` picks the
family for the active script and `typography.*` wires it in.

`typography.*` sets `writingDirection` but **not** `textAlign`. That is
deliberate: a physical `textAlign: "right"` fights a mirrored row, pinning the
label to the wrong side of its own `flex: 1` box. Unset means "auto", which
resolves to the start of the active direction — left in English, right in
Arabic. Set `textAlign` explicitly only where the design calls for it
(`"center"` in a toolbar), or to force LTR on Latin-only content such as an
email or phone field.

### Spacing

Use the tokens in `theme/AppSpacing.ts` (`spacing.md`, `radius.lg`), which are a
4pt grid. Prefer `gap` on a flex container over sibling margins. Screen gutter is
`SCREEN_PADDING` — match neighbouring screens before inventing a new value.

## Lists

Use `@shopify/flash-list`'s `FlashList`, not `FlatList`, for new code. Wire
`onEndReached` to the `pagination.fetchNextPageIfAvailable` the business-logic
hook returns.

## RTL

The root `direction` on `AppThemeProvider` mirrors the whole tree, and text
follows it because `typography.*` leaves `textAlign` at auto. Do **not** re-add a
physical `textAlign` to fix an alignment — it is almost always the row that
needs fixing.

For layout use logical edges (`marginStart`, `paddingEnd`, `start`/`end`) and
branch on `isRtl` for anything genuinely directional, like a back chevron.
