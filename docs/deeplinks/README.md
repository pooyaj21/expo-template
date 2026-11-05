# Universal / App Links scaffolding

## Enable in the app

Set a comma-separated host list in `.env` (see `.env.example`):

```
APP_LINK_HOSTS=links.example.com,www.example.com
```

Empty / unset disables `ios.associatedDomains` and `android.intentFilters` entirely.

`app.config.js` claims only precise paths (`/` and `/example/…`) — keep that list identical to what `src/app/+native-intent.tsx` answers and to the hosted association files below.

## Host these files

Serve **without redirects**, `Content-Type: application/json`:

| File                         | URL                                                     |
| ---------------------------- | ------------------------------------------------------- |
| `apple-app-site-association` | `https://<host>/.well-known/apple-app-site-association` |
| `assetlinks.json`            | `https://<host>/.well-known/assetlinks.json`            |

Replace `TEAMID`, package names (after `npm run rename`), and Android cert SHA-256 fingerprints before deploying.

## Local open helpers

```bash
bash scripts/deeplink.sh --check
bash scripts/deeplink.sh "apptemplate-develop://example/1"
bash scripts/deeplink.sh --dry-run "https://links.example.com/example/{EXAMPLE_ID}"

# or:
npx uri-scheme open "apptemplate-develop://example/1" --ios
```

`{TOKEN}` placeholders expand from `scripts/deeplink.env`.
