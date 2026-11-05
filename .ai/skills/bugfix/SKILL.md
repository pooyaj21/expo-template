---
name: bugfix
description: Fix a bug the house way — reproduce, locate the VLFA layer, minimal fix, verify on both platforms. Use when asked to fix a bug, crash, wrong behaviour, or "X doesn't work on Android/iOS".
---

# Fix a bug

## 1. Pin the symptom

- Platform(s), flavor (`develop` / `stage` / `production`), language (en / ar — RTL bugs only show in ar).
- Errors report through `reportError` (console). There is **no third-party crash reporting** in this template.

## 2. Locate the layer

Follow the chain from the route down and stop at the first layer that is wrong:

```
src/app/<route>.tsx
  → features/<feature>/presentation
  → business-logic/use*
  → data-access (*Queries → *Service → *Types)
  → store / core providers
```

Before editing a folder, read its rule in `.ai/rules/` (index in `general.md`).

## 3. Fix

- Smallest change that fixes the root cause, in the layer that owns it.
- Don't swallow errors. Network errors already auto-toast — never toast them again.
- If the root cause is a trap others will hit, record it (`rules` skill).

## 4. Verify

Run the `verify` skill. State exactly how to reproduce the fix on device.
