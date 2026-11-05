---
description: "Four-severity alerts queue, API bridge, and AppToast rendering"
globs: src/features/core/alerts/**/*.{ts,tsx},src/common/presentation/components/AppToast.tsx
alwaysApply: false
paths:
  - "src/features/core/alerts/**/*.{ts,tsx}"
  - "src/common/presentation/components/AppToast.tsx"
---

# Alerts

- Raise user-facing toasts through `useAlerts()` from `features/core/alerts/business-logic/alertContext` — not by calling `showAppToast` from feature screens.
- Prefer `messageKey` (en/ar) for client copy; pass `message` for already-localized API text.
- Four severities: `info` | `success` | `warning` | `error`. Queue dedupes and caps visible alerts.
- Per-request silence/force: axios config `alert: false | true | { severity?, title? }` — untyped envelopes only. Typed `meta.type` always wins.
- `AppToast` is the sonner host only. `AlertProvider` owns the queue and calls `showAppToast`. Do not re-subscribe `apiResponseChannel` inside AppToast (double toast).
- Mount `<AlertProvider>` inside Localization, beside `<AppToast />`. Do not import alerts from `common/`.
- Deep notes: `docs/alerts.md`.
