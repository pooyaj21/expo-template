---
description: "Blur — AppBlurView primitive, surface presets, Android blur-target rules; fetch before adding a blurred surface"
globs: src/common/presentation/components/AppBlurView.tsx,src/common/presentation/components/AppBlurTarget.tsx,src/common/presentation/components/AppToolbarBlur.tsx,src/common/presentation/providers/BlurTargetProvider.tsx,src/common/presentation/providers/PageBlurProvider.tsx,src/common/business-logic/hooks/useBlurTargetContext.ts,src/common/business-logic/hooks/usePageBlurContext.ts,src/common/presentation/components/PageContainer.tsx
alwaysApply: false
paths:
  - "src/common/presentation/components/AppBlurView.tsx"
  - "src/common/presentation/components/AppBlurTarget.tsx"
  - "src/common/presentation/components/AppToolbarBlur.tsx"
  - "src/common/presentation/providers/BlurTargetProvider.tsx"
  - "src/common/presentation/providers/PageBlurProvider.tsx"
  - "src/common/business-logic/hooks/useBlurTargetContext.ts"
  - "src/common/business-logic/hooks/usePageBlurContext.ts"
  - "src/common/presentation/components/PageContainer.tsx"
---

# Blur

On-demand reference. Pull this in before adding a blurred surface, touching
`AppBlurView`, `AppBlurTarget`, `AppToolbarBlur`, the blur providers, or a
`PageContainer` that opts into `blurToolbar`.

Blur answers one question — **what does this translucent surface sit on top
of** — and on Android that answer is not free: the platform has no backdrop
filter, so the content being blurred has to be nominated explicitly as a
_blur target_, and the blur view has to live outside it. Every rule below
exists because getting that wrong produces a specific, reproducible artefact.

## The primitive

`AppBlurView` (`src/common/presentation/components/AppBlurView.tsx`) is the
only blur in the app. **Never import `BlurView` from `expo-blur` directly in a
screen or component** — it has no preset, no Android capability check and no
fallback, so it renders an invisible no-op on most Android devices. Importing
`BlurTargetView` from `expo-blur` directly is fine and expected; that is how a
call site nominates content to be blurred.

| Export                          | Role                                                                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AppBlurView`                   | The component. Resolves the preset, decides native-vs-fallback, owns the scrim.                                                                              |
| `BlurSurfaceEnums`              | Closed catalog of surfaces — `CHROME`, `OVERLAY`, `VEIL`.                                                                                                    |
| `BlurSurfacePreset`             | The shape of one row of the tuning table.                                                                                                                    |
| `useBlurSurfacePreset(surface)` | Theme-aware preset read. `AppBlurView` resolves its surface through it.                                                                                      |
| `canBlurOnAndroid(preset, ref)` | The capability predicate — SDK, preset opt-in, target presence.                                                                                              |
| `BLUR_SCRIM_ALPHA`              | `0.6` on iOS, `0.75` on Android. The one scrim alpha; call sites building their own scrim colour use it so iOS and Android stay consistent with the presets. |

### Three usage forms

**1. `children`** — the children _are_ the content that gets blurred.
`AppBlurView` wraps them in its own internal `BlurTargetView` and self-targets,
so Android blur works with **no ref wiring at the call site**. Use this whenever
the thing being blurred can be the component's own child.

**2. `overlay`** — content drawn **above** the blur (spinners, a toolbar).
Note this is the **opposite** of plain `expo-blur`, where `children` sit above
the blur. In `AppBlurView`, `children` go **under**: they are the backdrop,
`overlay` is the foreground.

**3. childless + `blurTarget`** — a bare surface that blurs an externally
supplied `BlurTargetView` ref. Use this when what you blur is a **sibling** or
an **ancestor's** content rather than a child. Production chrome (toolbar, tab
bar) uses this form.

## The surface presets

`getBlurPresets` inside `AppBlurView.tsx` is the single tuning knob:

| Surface                    | `iosIntensity` | `androidIntensity` | `blurReductionFactor` | `scrimColor`                                           | `allowAndroidBlur` |
| -------------------------- | -------------- | ------------------ | --------------------- | ------------------------------------------------------ | ------------------ |
| `BlurSurfaceEnums.CHROME`  | 60             | 75                 | 4                     | `withAlpha(colors.background.white, BLUR_SCRIM_ALPHA)` | `true`             |
| `BlurSurfaceEnums.OVERLAY` | 60             | 75                 | 4                     | `"transparent"`                                        | `true`             |
| `BlurSurfaceEnums.VEIL`    | 10             | 20                 | 5                     | `"transparent"`                                        | `true`             |

- **`iosIntensity` / `androidIntensity`** — blur strength, `0`–`100`. Split
  because the two engines are not comparable at the same number.
- **`blurReductionFactor`** — Android only.
- **`scrimColor`** — the translucent fill painted _behind_ the blur layer.
  `"transparent"` means "the blur is the whole effect".
- **`allowAndroidBlur`** — per-surface opt-out of the native Android path.

Per-call `intensity`, `blurReductionFactor` and `scrimColor` props override the
preset for **one instance only**.

### What the surfaces mean in practice

- **`OVERLAY`** — strong, transparent-scrim frosted glass (tab bars, temporary veils).
- **`VEIL`** — light haze (low intensity) for small interactive overlays.
- **`CHROME`** — opaque-ish white scrim; used by `AppToolbarBlur`.

## Android rules

### Android blurs only under three conditions

`canBlurOnAndroid` requires **all** of: SDK ≥ 31, the surface's
`allowAndroidBlur`, and a non-null blur target ref. Fail any one and
`AppBlurView` renders a cheaper fallback: a plain `View` carrying the scrim,
plus an absolute tint layer. **No native blur view is mounted on that path.**

So on Android a missing `blurTarget` is not an error; it is a silently flat
surface. If a surface "doesn't blur on Android", check the target first.

### Only `dimezisBlurViewSdk31Plus`

`AppBlurView` passes `blurMethod="dimezisBlurViewSdk31Plus"` and nothing else.
**Never `dimezisBlurView`** — that is the pre-SDK-31 path with a documented
performance hit. Below SDK 31 the answer is the fallback scrim.

### Style the content inside `BlurTargetView`, never `BlurTargetView` itself

`ExpoBlurTargetView` forwards its children into an **inner** `BlurTarget`
ViewGroup and Dimezis captures that inner view. React Native applies `style` to
the outer host view, which is **not** the captured view. Put background, border
radius and padding on a child `View` inside the target.

### A blur target needs an opaque background

Otherwise the blur samples the window background instead of your content. Set
`backgroundColor` on a child inside the `BlurTargetView`.

### A `BlurView` must never be a descendant of the target it blurs

On SDK 31+ Dimezis uses `RenderNodeBlurController`, which has **no guard
excluding the BlurView from the capture**. Nesting records the BlurView's
display list back into the target's RenderNode: a cycle. This is why the
toolbar renders through a portal rather than in place.

### Keep grey borders out of the captured content

The blur kernel smears edge pixels inward, so a 1px divider border _inside_ the
target produces a grey band along every edge of the blurred surface. Keep
borders on an outer `View` outside the `BlurTargetView`.

### `blurReductionFactor` is Android-only

```
android blur radius = androidIntensity / blurReductionFactor
```

Tune Android strength with this before changing `androidIntensity` when only
Android looks wrong.

## Don't double-scrim

If a parent already paints a translucent background and the blur layer paints
the same colour again, the alphas **stack** and bury the blur.

**Rule: the scrim is painted exactly once per surface.**

When a chrome card needs its own background for elevation/shadow (e.g. a tab
bar), keep the colour on the card and pass `scrimColor="transparent"` on the
blur layer.

## Where the target wiring lives

Two independent target systems, because tab chrome and the toolbar blur
different things.

### Tab / route chrome — per-route keyed targets

- `BlurTargetProvider` (`src/common/presentation/providers/BlurTargetProvider.tsx`)
  - `useBlurTargetContext` (`src/common/business-logic/hooks/useBlurTargetContext.ts`)
    — holds a `Map<string, RefObject<View | null>>` and hands out stable refs via
    `getTarget(key)`. Refs are created lazily and never replaced.
- `AppBlurTarget` — wraps children in a `BlurTargetView` whose ref comes from
  `getTarget(targetKey)`.

**Mount `BlurTargetProvider` above the tab navigator** (typically in
`src/app/(tabs)/_layout.tsx`, or at the root layout above any chrome that reads
keyed targets). Wrap **each tab screen** in
`<AppBlurTarget targetKey={route.key}>` via `screenLayout` so the tab bar can
blur the focused route with `getTarget(state.routes[state.index].key)`.

Keyed by **`route.key`** because tab screens stay mounted: a single shared ref
would blur whichever tab mounted last.

### Toolbar — the `PageBlurContext` portal, behind `blurToolbar`

`PageBlurProvider` wraps the screen's children in a `BlurTargetView`, exposing
both that ref and a `setToolbar(id, node)` slot.

**`PageContainer` only mounts it when the screen passes `blurToolbar`.** The
prop defaults to `false`. Pass it **only** on a screen that renders
`AppToolbarBlur` _and_ lets content scroll under it; on any other screen it buys
nothing and costs a `BlurTarget`.

```tsx
<PageContainer caringSides="none" blurToolbar>
  <AppToolbarBlur backIcon title={title} />
  <AppList data={items} renderItem={renderItem} />
</PageContainer>
```

`AppToolbarBlur` **publishes itself into that slot** instead of rendering in
place, keyed by `useId`; the provider renders the last-published entry as a
**sibling** of the `BlurTargetView` so the toolbar's `BlurView` is not a
descendant of the target it reads.

Two details that must not be "simplified":

- The publish effect's dependency is the toolbar **element itself**, so the
  published node never goes stale as props change.
- `AppToolbarBlur` **falls back to rendering in place** when there is no
  provider — scrim only, no target, no Android blur. Keep the mechanism.

`AppToolbarBlur` and `blurToolbar` are 1:1 — every screen that renders the
frosted toolbar passes the flag, and every screen that passes the flag renders
the frosted toolbar. A screen that wants an opaque bar uses the plain in-flow
`AppToolbar` with the inset on `caringSides`.

### A screen that insets content on a wrapper uses plain `AppToolbar`

If the top inset sits on a wrapper `View` (or on a web view's own
`containerStyle`), the content box starts **below** the toolbar and nothing ever
passes behind it. The blur then samples the page background and resolves to a
flat sheet. Those screens render plain **`AppToolbar`** in flow and move the
inset onto `PageContainer`'s `caringSides`.

### Nested targets are fine

A tab screen opted into `blurToolbar` has **two** nested `BlurTargetView`s: the
tab-bar target from `screenLayout` wraps the screen, and `PageContainer`'s page
target sits inside it. There is no cycle, because neither target contains the
blur view that reads it.

## Performance

Each **active** Android blur mounts a native blur view and redraws the target's
whole view tree into a canvas **every frame while visible**. The fallback path
mounts none.

### A `BlurTargetView` costs even with no blur attached

`BlurTarget` allocates its `RenderNode` whenever `SDK_INT >= 31` and
unconditionally re-records on each draw. So every mounted target redirects its
subtree's draw through an extra display list forever, blurred or not. On iOS
`BlurTargetView` resolves to a plain RN `View`, so `blurToolbar` is an
Android-cost switch.

Mount `BlurTargetView` only while a blur layer is actually shown in recycled
list cells. A resting cell must not keep a target around "just in case".

Measure blur performance on a **RELEASE** build only.

## Adding a new blurred surface

1. **Pick a surface preset.** Reuse `OVERLAY` or `VEIL` if one of them is the
   look you want. Only if neither fits, add a member to `BlurSurfaceEnums` and
   a row to `getBlurPresets`.
2. **Decide the form** — `children` (self-targeting) if the blurred content can
   be a child; `overlay` for anything that must draw on top; childless +
   `blurTarget` if the content is a sibling or an ancestor's.
3. **If you want Android blur, make sure a target exists** and that the
   captured content has an **opaque background**, set on a child inside the
   `BlurTargetView`.
4. **Check you are not double-scrimming** against a parent.
5. **Verify on a release Android build**.

## Provider mount points (required wiring outside this module)

These providers are **not** auto-mounted. Wire them where chrome lives:

1. **`BlurTargetProvider`** — wrap the tab navigator (or root stack above any
   keyed blur chrome) in `src/app/(tabs)/_layout.tsx` / `src/app/_layout.tsx`.
2. **`AppBlurTarget`** — use `screenLayout` on the tab navigator to wrap each
   screen with `targetKey={route.key}`.
3. **`PageBlurProvider`** — already mounted by `PageContainer` when
   `blurToolbar` is set; do not mount a second copy at the root.

## Do / don't

**Do**

- Go through `AppBlurView` for every blur.
- Put the surface's permanent look in `getBlurPresets`, one-offs in props.
- Give every Android blur target an opaque background, set on a child.
- Keep borders and dividers outside the captured content.
- Use `BLUR_SCRIM_ALPHA` when hand-building a scrim colour.
- Measure on a release Android build.

**Don't**

- Import `BlurView` from `expo-blur` in a screen or component.
- Use `blurMethod="dimezisBlurView"`.
- Style `BlurTargetView` itself and expect the blur to see it.
- Nest a `BlurView` inside the `BlurTargetView` it blurs.
- Paint the same scrim colour on both a parent and the blur layer.
- Share one blur target ref across tab screens — they are keyed by `route.key`.
- Pass `blurToolbar` to a `PageContainer` that has no `AppToolbarBlur` under it.
- Render `AppToolbarBlur` **without** `blurToolbar` — the two are 1:1.
- Build an opaque header as an absolutely-positioned bar with the content
  padded past it — an opaque header is the in-flow `AppToolbar` with the inset
  on `caringSides`.
- Assume a missing `blurTarget` will surface as an error; it renders a flat
  scrim and says nothing.
