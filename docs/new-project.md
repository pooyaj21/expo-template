# Starting a new project from this template

End-to-end path from a fresh clone to the first local release build. Deep build notes live in `docs/build-and-release.md`; deep-link host setup in `docs/deeplinks/`.

## 1. Clone

```bash
git clone <this-repo-url> my-app
cd my-app
nvm use                 # Node from .nvmrc
npm ci
```

Do **not** reuse this template's `git-crypt` key on a product repo (the template key is for the public starter only).

## 2. Rename identity

One command rewrites the `IDENTITY` block in `app.config.js` plus `package.json`, Maestro `appId`, README title, and leftover `com.pj21.apptemplate` / `apptemplate` / `app-template` strings:

```bash
npm run rename -- --name "My App" --slug my-app --bundle-id com.acme.myapp --scheme myapp

# preview only:
npm run rename -- --dry-run --name "My App" --slug my-app --bundle-id com.acme.myapp --scheme myapp
```

Per-flavor suffixes stay automatic after rename:

| Flavor     | Bundle / package         | Display name   | Scheme          |
| ---------- | ------------------------ | -------------- | --------------- |
| develop    | `com.acme.myapp.develop` | `My App Dev`   | `myapp-develop` |
| stage      | `com.acme.myapp.stage`   | `My App Stage` | `myapp-stage`   |
| production | `com.acme.myapp`         | `My App`       | `myapp`         |

Icons live under `assets/images/{develop,stage,production}/` — replace the placeholders before shipping.

## 3. Fresh git-crypt key

`.env` is encrypted with [`git-crypt`](https://github.com/AGWA/git-crypt). A new product must **not** keep the template keyring:

```bash
brew install git-crypt   # once

# Drop the template keyring (collaborators with the old key can no longer decrypt).
rm -rf .git-crypt

# Start a new key for THIS repo.
git-crypt init
mkdir -p ~/.config/git-crypt
git-crypt export-key ~/.config/git-crypt/my-app.key

# Confirm .gitattributes still marks .env:
#   .env filter=git-crypt diff=git-crypt
```

Store `~/.config/git-crypt/my-app.key` in a password manager. Teammates run `git-crypt unlock <path-to-key>` after clone.

If you already committed with the template key, rotate by replacing `.env` contents after `git-crypt init` and committing again so the ciphertext is under the new key only.

## 4. Environment file

```bash
cp .env.example .env
```

Fill at least:

- `EXPO_PUBLIC_FLAVOR` (default `develop`)
- `EXPO_PUBLIC_API_*_URL`
- `APPLE_TEAM_ID` (iOS prebuild / local signing)
- `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`
- `APP_LINK_HOSTS` — comma-separated https hosts, or leave empty to disable universal / app links

## 5. Android keystore

```bash
keytool -genkeypair -v -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$ANDROID_KEYSTORE_PASSWORD" -keypass "$ANDROID_KEY_PASSWORD" \
  -alias "$ANDROID_KEY_ALIAS" -keystore key.jks
```

`key.jks` is gitignored at the repo root. `plugins/withAndroidSigning.js` copies it into `android/app/` on prebuild; Fastlane local lanes also accept `KEYSTORE_PATH` (defaults to `./key.jks`).

## 6. Ruby / Fastlane prerequisites

Provinc-style lanes ship under `fastlane/{android,ios}` and are injected into the generated native projects by `plugins/withFastlane.js` during `expo prebuild`.

```bash
# Ruby via system / rbenv / asdf — then:
bundle install          # root Gemfile: fastlane, dotenv, cocoapods, xcodeproj
```

`fastlane` must be on `PATH` for `scripts/build-local.sh` (Bundler installs a binstub — use `bundle exec` or add `$(pwd)/vendor/bundle/...` / `bundle binstubs`).

## 7. First native run

```bash
npm run ios             # expo run:ios  (dev client)
# or
npm run android
```

Expo Go is not supported — native modules require a dev client.

## 8. First local release build

```bash
npm run build:develop                 # both platforms, parallel
bash scripts/build-local.sh --flavor develop --platform ios
bash scripts/build-local.sh --flavor stage --platform android
```

Flow: `expo prebuild --clean` → Fastlane `build_local` in `android/` and/or `ios/`. Logs → `build-logs/`.

Optional store-upload lanes (`publish_play_internal`, iOS `upload`) stay env-parameterised and are **not** invoked by `build-local.sh`. See `docs/build-and-release.md`.

## Checklist

- [ ] `npm run rename -- …`
- [ ] New `git-crypt` key exported and backed up
- [ ] `.env` filled from `.env.example`
- [ ] `key.jks` generated; Android passwords set
- [ ] `bundle install`
- [ ] `npm run ios` / `android` boots the example
- [ ] `npm run build:develop` produces artifacts
- [ ] Replace `assets/images/{flavor}/*` placeholders
- [ ] If using https app links: set `APP_LINK_HOSTS`, host `docs/deeplinks/*` templates on each host
