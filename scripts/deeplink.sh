#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
usage: scripts/deeplink.sh <url> [url...]
       scripts/deeplink.sh --check
       scripts/deeplink.sh --dry-run <url> [url...]

Opens a deep link / universal link on the running simulator or emulator.

env:
  DL_TARGET  ios | android | both | auto      (default: auto — whatever is running)
  DL_HOST    rewrite the host of https:// urls (e.g. links.example.com)
  DL_LOCALE  insert a locale segment into https:// urls (en | ar)
  DL_SERIAL  adb serial, when several Android devices are attached
  DL_ENV     placeholder file (default: scripts/deeplink.env)
  DL_DRY     1 to print the resolved url without opening it

{PLACEHOLDER} tokens in the url are filled from scripts/deeplink.env.
EOF
}

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
env_file="${DL_ENV:-$script_dir/deeplink.env}"
if [ -f "$env_file" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$env_file"
  set +a
fi

ios_ready() { xcrun simctl list devices booted 2>/dev/null | grep -q Booted; }
android_ready() { adb ${DL_SERIAL:+-s "$DL_SERIAL"} get-state >/dev/null 2>&1; }

resolve_target() {
  local target="${DL_TARGET:-auto}"
  if [ "$target" != auto ]; then
    printf '%s' "$target"
    return
  fi
  local ios=no android=no
  ios_ready && ios=yes
  android_ready && android=yes
  if [ "$ios" = yes ] && [ "$android" = yes ]; then
    printf 'both'
  elif [ "$ios" = yes ]; then
    printf 'ios'
  elif [ "$android" = yes ]; then
    printf 'android'
  else
    printf 'none'
  fi
}

expand() {
  local url="$1" name value
  while [[ "$url" =~ \{([A-Za-z_][A-Za-z0-9_]*)\} ]]; do
    name="${BASH_REMATCH[1]}"
    value="${!name-}"
    if [ -z "$value" ]; then
      echo "deeplink: no value for {$name} — set it in $env_file" >&2
      exit 1
    fi
    url="${url//\{$name\}/$value}"
  done
  if [[ "$url" == https://* ]]; then
    [ -n "${DL_HOST:-}" ] && url="$(printf '%s' "$url" | sed -E "s#^https://[^/?]+#https://$DL_HOST#")"
    [ -n "${DL_LOCALE:-}" ] && url="$(printf '%s' "$url" | sed -E "s#^(https://[^/?]+)/?#\1/$DL_LOCALE/#")"
  fi
  printf '%s' "$url"
}

open_ios() {
  printf '  ios      %s\n' "$1"
  [ "${DL_DRY:-0}" = 1 ] && return 0
  xcrun simctl openurl booted "$1"
}

open_android() {
  printf '  android  %s\n' "$1"
  [ "${DL_DRY:-0}" = 1 ] && return 0
  adb ${DL_SERIAL:+-s "$DL_SERIAL"} shell am start -W -a android.intent.action.VIEW -d "'$1'" |
    sed -n 's/^\(Status\|Error\|Warning\|Activity\)/    &/p'
}

[ $# -gt 0 ] || { usage; exit 2; }

if [ "$1" = "--check" ] || [ "$1" = "-c" ]; then
  echo "target:   $(resolve_target)   (DL_TARGET=${DL_TARGET:-auto})"
  echo "env file: $env_file $([ -f "$env_file" ] || echo '(missing)')"
  echo "https host: ${DL_HOST:-(unset)}${DL_LOCALE:+   locale: /$DL_LOCALE}"
  ios_ready && echo "ios:      $(xcrun simctl list devices booted | sed -n 's/^ *\(.*\) (Booted)/\1/p' | head -3)" || echo "ios:      no booted simulator"
  android_ready && echo "android:  $(adb ${DL_SERIAL:+-s "$DL_SERIAL"} devices | sed -n '2p')" || echo "android:  no device"
  exit 0
fi

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  usage
  exit 0
fi

if [ "$1" = "--dry-run" ] || [ "$1" = "-n" ]; then
  DL_DRY=1
  shift
  [ $# -gt 0 ] || { usage; exit 2; }
fi

target="$(resolve_target)"
[ "${DL_DRY:-0}" = 1 ] && [ "$target" = none ] && target=both
if [ "$target" = none ]; then
  echo "deeplink: no booted simulator and no adb device — start one first" >&2
  exit 1
fi

for raw in "$@"; do
  url="$(expand "$raw")"
  [ "$url" = "$raw" ] && printf '%s\n' "$raw" || printf '%s  →  %s\n' "$raw" "$url"
  case "$target" in
    ios) open_ios "$url" ;;
    android) open_android "$url" ;;
    both)
      open_ios "$url"
      open_android "$url"
      ;;
    *)
      echo "deeplink: unknown DL_TARGET '$target'" >&2
      exit 2
      ;;
  esac
done
