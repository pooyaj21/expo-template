---
description: "Blur — AppBlurView primitive, surface presets, Android blur-target rules; fetch before adding a blurred surface"
globs: src/common/presentation/components/app/AppBlurView.tsx,src/common/presentation/components/app/AppBlurTarget.tsx,src/common/presentation/components/app/AppToolbarBlur.tsx,src/common/presentation/providers/BlurTargetContext.tsx,src/common/presentation/providers/PageBlurContext.tsx,src/common/presentation/components/PageContainer.tsx
alwaysApply: false
paths:
  - "src/common/presentation/components/app/AppBlurView.tsx"
  - "src/common/presentation/components/app/AppBlurTarget.tsx"
  - "src/common/presentation/components/app/AppToolbarBlur.tsx"
  - "src/common/presentation/providers/BlurTargetContext.tsx"
  - "src/common/presentation/providers/PageBlurContext.tsx"
  - "src/common/presentation/components/PageContainer.tsx"
---

# Blur

On-demand reference. Pull this in before adding a blurred surface, touching
`AppBlurView`, `AppBlurTarget`, `AppToolbarBlur`, `BlurTargetContext`,
`PageBlurContext`, or `PageContainer.blurToolbar`.

Blur answers one question — **what does this translucent surface sit on top
of** — and on Android that answer is not free: the platform has no backdrop
filter, so the content being blurred has to be nominated explicitly as a
_blur target_, and the blur view has to live outside it.

## The primitive

`AppBlurView` is the only blur in the app. **Never import `BlurView` from
`expo-blur` directly in a screen or component** — it has no preset, no Android
capability check and no fallback. Importing `BlurTargetView` from `expo-blur`
directly is fine when nominating content to blur.

| Export                          | Role                                                        |
| ------------------------------- | ----------------------------------------------------------- |
| `AppBlurView` (default)         | Resolves the preset, decides native-vs-fallback, owns scrim |
| `BlurSurfaceEnums`              | `CHROME`, `OVERLAY`, `VEIL`                                 |
| `useBlurSurfacePreset(surface)` | Theme-aware preset read                                     |
| `canBlurOnAndroid(preset, ref)` | SDK + preset opt-in + target presence                       |
| `BLUR_SCRIM_ALPHA`              | `0.6` iOS / `0.75` Android                                  |

### Three usage forms

1. **`children`** — children _are_ the blurred backdrop; `AppBlurView` wraps them
   in its own `BlurTargetView` (self-targets). No call-site ref needed.
2. **`overlay`** — foreground above the blur (toolbar chrome). Opposite of plain
   `expo-blur`, where `children` sit above.
3. **childless + `blurTarget`** — bare surface blurring an external sibling/
   ancestor target. Production shell call sites use this form.

## Surface presets

| Surface   | Role in this template                                                   |
| --------- | ----------------------------------------------------------------------- |
| `CHROME`  | Scrimmed frosted bar — `AppToolbarBlur`                                 |
| `OVERLAY` | Transparent-scrim frosted glass — reserved for a future tab bar / sheet |
| `VEIL`    | Light haze — reserved for feature overlays                              |

Per-call `intensity` / `blurReductionFactor` / `scrimColor` override the preset
for one instance only. Global retunes belong in `getBlurPresets`.

## Android rules

1. Native blur only when **all** of: SDK ≥ 31, `allowAndroidBlur`, non-null
   `blurTarget`. Otherwise render the flat scrim fallback — no native blur view.
2. Only `blurMethod="dimezisBlurViewSdk31Plus"`. Never `dimezisBlurView`.
3. Style content **inside** `BlurTargetView`, never the target host itself
   (outer host style is not what Dimezis captures).
4. Target needs an opaque background or the blur samples the window colour.
5. A `BlurView` must **never** be a descendant of the target it blurs (HWUI
   cycle on SDK 31+). Toolbar uses the `PageBlurContext` portal for this.
6. Keep grey borders outside the captured content — the kernel smears edges in.
7. Paint the scrim **once** per surface (no double-scrim with parent backgrounds).

## Target wiring in the shell

### Root — `BlurTargetProvider`

`CoreProviders` wraps the tree in `BlurTargetProvider` so screens can register
named targets via `AppBlurTarget`.

### Toolbar — `PageBlurContext` behind `blurToolbar`

- `PageContainer` mounts `PageBlurProvider` **only** when `blurToolbar` is true.
- Pass `blurToolbar` only on screens that render `AppToolbarBlur` **and** let
  content scroll under the bar. Default screens keep plain in-flow `AppToolbar`
  with `safeEdges="top"`.
- `AppToolbarBlur` publishes into the portal so the blur view stays a sibling of
  the target; without a provider it falls back to in-place (iOS blur, Android
  flat scrim).

```tsx
<PageContainer safeEdges="none" blurToolbar>
  <AppToolbarBlur title={title} />
  <AppList data={items} renderItem={renderItem} />
</PageContainer>
```
