# Alerts

Four-state alert system — **info · success · warning · error** — rendered through a single toast surface (`AppToast` / sonner-native).

Lives in `src/features/core/alerts/` as a shared VLFA slice.

## Layers

| Piece                                                                                  | Layer             | Role                                                     |
| -------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------- |
| `alertTypes` · `alertChannel` · `alertBridge`                                          | `data-access/`    | React-free types, non-React publish, API envelope policy |
| `alertContext` (`useAlerts`) · `useAlertQueue` · `alertPolicy` · `useApiAlertMessages` | `business-logic/` | queue, dedupe, channel subscriptions                     |
| `AlertProvider`                                                                        | `presentation/`   | context + sync queue → `showAppToast`                    |

`common/` must never import this slice. Network failures arrive on `apiErrorChannel` / `apiResponseChannel`; the queue subscribes.

## Raising alerts

```tsx
import { useAlerts } from "@/features/core/alerts/business-logic/alertContext";

const { show, showSuccess, showError } = useAlerts();

show({ severity: "success", messageKey: "common.ok" });
showError({ message: apiLocalizedMessage });
```

`show` returns the alert id, or `null` when deduped. Prefer `messageKey` for catalog copy; pass `message` for already-localized API text.

## Network bridge

- Subscribes to `apiResponseChannel` (typed `meta.message` + `meta.type`) and `apiErrorChannel`.
- Per-request override on axios config: `{ alert: false | true | { severity?, title? } }` — applies to **untyped** envelopes only. A non-null `meta.type` always surfaces.
- `EXPO_PUBLIC_ALERT_ERROR_MODE=all` shows every channel failure (dev/QA).

## Mount

Wrap the tree with `<AlertProvider>` **inside** Localization and beside `<AppToast />` (Toaster host). AppToast no longer subscribes to API channels itself — that would double-toast.
