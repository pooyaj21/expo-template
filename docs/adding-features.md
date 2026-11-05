# Adding features

## Scaffold

```bash
npm run feature -- demo
```

Creates:

```
src/features/demo/
  data-access/
    demoTypes.ts
    demoService.ts
    demoQueries.ts
  business-logic/
    useDemo.ts
  presentation/
    DemoPage.tsx
```

## Fill in the layers

1. **Types** — snake_case DTOs; reuse `@/common/data-access/type/responseTypes`.
2. **Service** — `apiClient` methods returning `response.data`.
3. **Queries** — wrap every key with `useDefaultQueryKey([...])`.
4. **Hook** — `useDemo()` exposes a flat API for the page; own side effects here.
5. **Page** — `PageContainer` + `AppToolbar` + `StateHandler` + shared `App*` components. Add `testID`s. Ship a tablet layout in the same change.
6. **Route** — thin file under `src/app/` that renders `DemoPage`. Register in `_layout.tsx`.
7. **Paths** — add `routes.demo…` in `src/common/business-logic/routes/paths.ts`.
8. **Strings** — keys in `en.json` / `ar.json` (`MessageKey`).
9. **Optional flag** — one source in `flagCatalog.ts`; gate with `useFeatureFlag`.
10. **Optional store** — slice under `business-logic/store/`, spread into `useAppStore`.

Follow the `feature` / `endpoint` / `screen` skills under `.ai/skills/`. Verify with the `verify` skill (`npm run type:check`, `npm run lint`).

## Example reference

`src/features/example/` — jsonplaceholder `/posts` list + detail (detail behind `EXAMPLE_DETAIL` env flag).
