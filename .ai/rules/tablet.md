---
description: "Tablet / large-screen layout — every page is built for phone AND tablet"
globs: src/features/**/presentation/**/*.{ts,tsx},src/common/presentation/**/*.{ts,tsx},src/common/presentation/token/dimensions.ts,src/common/business-logic/hooks/useDimensions.ts
alwaysApply: false
paths:
  - "src/features/**/presentation/**/*.{ts,tsx}"
  - "src/common/presentation/**/*.{ts,tsx}"
  - "src/common/presentation/token/dimensions.ts"
  - "src/common/business-logic/hooks/useDimensions.ts"
---

# Tablet & large screens

`ios.supportsTablet` is on. Real users open the app on iPads, Android tablets, foldables and split screen. **Every new or changed page ships with a tablet layout in the same change** — a phone layout stretched to 1024 px is a bug, not "later".

## The switch: `isTablet` from `useDimensions`

```ts
import { useDimensions } from "@/common/business-logic/hooks/useDimensions";

const { width, height, isTablet } = useDimensions();
```

- Branch on `isTablet` at render time only. It is reactive to rotation / split screen.
- ❌ Never: `Dimensions.get(...)` in a screen, a raw `useWindowDimensions().width > N` check, a new ad-hoc breakpoint constant, or `Platform.isPad`.

## Patterns

| Page shape                      | Approach                                                                |
| ------------------------------- | ----------------------------------------------------------------------- |
| Form / settings / single column | Center a max-width column with horizontal padding from dimension tokens |
| Full-width content / lists      | Cap content width and center; compute `numColumns` from width           |
| Detail with media + info        | Two-column row on tablet, stacked on phone                              |
| Bottom sheet                    | Cap sheet width on tablet; grids inside use the sheet width             |

Tokens live in `src/common/presentation/token/dimensions.ts` (and related helpers under `common/business-logic`). Feature-specific tablet sizes belong next to the feature — no magic numbers for tablet column widths in the page file.

## Rules for every page

1. **No fixed column counts.** Compute `numColumns` from width / helpers.
2. **No content edge-to-edge on tablet** except full-bleed media.
3. **Two columns use logical layout** (`flexDirection: "row"`, `marginStart/End`, `gap`).
4. **Skeletons match the tablet layout.**
5. **Phone layout stays pixel-identical** — branch with `isTablet`; don't retune phone spacing while adding tablet.
6. **Rotation keeps state** — don't refetch or reset forms because `isTablet` flipped.

## Verify

Run each changed page on iPad (portrait + landscape + rotate), a narrow split, and an Android tablet / foldable. Check Arabic on tablet for column order.
