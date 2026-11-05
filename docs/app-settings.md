# App settings

Boot-warmed remote settings cache for `GET {apiBaseUrl}/app/settings`.

Code: `src/features/core/app-settings/`.

## Behaviour

- Soft boot step (`registerBootStep`, id `app-settings`) hydrates from `appStorage` then refreshes.
- TTL: 5 minutes. Scoped to `environmentId` + `language` from `queryScopeRegistry`.
- Scope changes invalidate and refetch.
- Network / envelope failures soft-fail to `DEFAULT_APP_SETTINGS` and log via `prettyLog` (never hard-fail boot).

## Usage

```tsx
import { useAppSettings } from "@/features/core/app-settings/business-logic/useAppSettings";

const { settings, isLoading, refresh } = useAppSettings();
// settings.static_pages.privacy_policy …
```

Brand-free payload: `static_pages` (+ optional `extras`). Extend types in `appSettingsTypes` when the backend grows.

## Wiring

`CoreBootstrap` side-effect-imports the manager so the boot step registers before the first request.
