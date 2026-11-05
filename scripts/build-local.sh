#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
usage: scripts/build-local.sh [options]

Regenerates the native projects, then runs the local release lanes for both
platforms at the same time:

  npx expo prebuild --clean
  cd android && fastlane android build_local   \ in parallel
  cd ios     && fastlane ios build_local       /

options:
  -f, --flavor <development|stage|production>
                                     build flavor               (default: .env)
  -p, --platform <android|ios|both>  which platforms to build   (default: both)
      --lane <name>                  lane to run                (default: build_local)
      --skip-prebuild                build the existing android/ ios/ folders
      --no-clean                     prebuild without --clean
      --sequential                   android first, then ios
      --quiet                        only write log files, do not stream output
  -h, --help                         this text

--flavor exports EXPO_PUBLIC_FLAVOR for prebuild AND for the JS bundle the
fastlane lanes embed. A shell variable beats .env in @expo/env, so .env is left
untouched; without --flavor the EXPO_PUBLIC_FLAVOR already in .env is used.

Logs are written to build-logs/<platform>-<timestamp>.log.
EOF
}

flavor=
platform=both
lane=build_local
do_prebuild=1
clean=1
parallel=1
stream=1

while [ $# -gt 0 ]; do
  case "$1" in
    -f|--flavor) flavor="${2:-}"; shift 2 ;;
    -p|--platform) platform="${2:-}"; shift 2 ;;
    --lane) lane="${2:-}"; shift 2 ;;
    --skip-prebuild) do_prebuild=0; shift ;;
    --no-clean) clean=0; shift ;;
    --sequential) parallel=0; shift ;;
    --quiet) stream=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

case "$platform" in
  both|android|ios) ;;
  *) echo "--platform must be android, ios or both (got '$platform')" >&2; exit 2 ;;
esac

case "$flavor" in
  dev|development) flavor=develop ;;
  prod) flavor=production ;;
esac

case "$flavor" in
  ""|develop|development|stage|production) ;;
  *) echo "--flavor must be develop, stage or production (got '$flavor')" >&2; exit 2 ;;
esac

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
log_dir="$root/build-logs"
stamp="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$log_dir"

builds_android() { [ "$platform" = both ] || [ "$platform" = android ]; }
builds_ios() { [ "$platform" = both ] || [ "$platform" = ios ]; }

if builds_ios && [ "$(uname -s)" != Darwin ]; then
  echo "iOS builds need macOS — re-run with --platform android" >&2
  exit 1
fi

for tool in npx fastlane; do
  command -v "$tool" >/dev/null 2>&1 || { echo "$tool is not on PATH" >&2; exit 1; }
done

say() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }

if [ -n "$flavor" ]; then
  # @expo/env never overwrites a variable that is already in the environment, so
  # exporting here beats .env for prebuild, for the JS bundle the lanes embed,
  # and for app.config.js — without editing the developer's .env file.
  export EXPO_PUBLIC_FLAVOR="$flavor"
  export APP_ENV="$flavor"
  say "flavor: $flavor (overriding .env)"
  if [ "$do_prebuild" -eq 0 ]; then
    echo "  warning: --skip-prebuild keeps the native config generated for the" >&2
    echo "  previous flavor (app-link hosts, plugins). Only the JS bundle changes." >&2
  fi
else
  env_flavor="$(sed -n 's/^[[:space:]]*EXPO_PUBLIC_FLAVOR[[:space:]]*=[[:space:]]*//p' "$root/.env" 2>/dev/null | tail -1)"
  say "flavor: ${env_flavor:-production (EXPO_PUBLIC_FLAVOR unset in .env)}"
fi

if [ "$do_prebuild" -eq 1 ]; then
  prebuild_args=(prebuild)
  [ "$clean" -eq 1 ] && prebuild_args+=(--clean)
  [ "$platform" != both ] && prebuild_args+=(--platform "$platform")

  say "npx expo ${prebuild_args[*]}"
  ( cd "$root" && npx expo "${prebuild_args[@]}" )
else
  say "skipping prebuild"
fi

# PIPESTATUS[0] is fastlane's own exit code; the subshell writes it to a file
# because a backgrounded pipeline's status is not reachable from the parent.
run_lane() {
  local name="$1" status_file="$2" log_file="$3"
  (
    cd "$root/$name"
    set +e
    set +o pipefail
    if [ "$stream" -eq 1 ]; then
      fastlane "$name" "$lane" 2>&1 | tee "$log_file" | awk -v p="[$name] " '{print p $0; fflush()}'
      echo "${PIPESTATUS[0]}" >"$status_file"
    else
      fastlane "$name" "$lane" >"$log_file" 2>&1
      echo "$?" >"$status_file"
    fi
  )
}

android_log="$log_dir/android-$stamp.log"
ios_log="$log_dir/ios-$stamp.log"
android_status="$log_dir/.android-$stamp.status"
ios_status="$log_dir/.ios-$stamp.status"
started=$SECONDS

if [ "$parallel" -eq 1 ]; then
  say "building $platform in parallel — lane: $lane"
  builds_android && run_lane android "$android_status" "$android_log" &
  builds_ios && run_lane ios "$ios_status" "$ios_log" &
  wait
else
  say "building $platform sequentially — lane: $lane"
  builds_android && run_lane android "$android_status" "$android_log"
  builds_ios && run_lane ios "$ios_status" "$ios_log"
fi

elapsed=$((SECONDS - started))
failed=0

report() {
  local name="$1" status_file="$2" log_file="$3" artifact_glob="$4"
  local status
  status="$(cat "$status_file" 2>/dev/null || echo 1)"
  rm -f "$status_file"

  if [ "$status" -eq 0 ]; then
    printf '  \033[32m✓\033[0m %-8s %s\n' "$name" "$(ls -t $artifact_glob 2>/dev/null | head -1)"
  else
    failed=1
    printf '  \033[31m✗\033[0m %-8s exit %s — %s\n' "$name" "$status" "${log_file#$root/}"
  fi
}

say "done in $((elapsed / 60))m $((elapsed % 60))s"
builds_android && report android "$android_status" "$android_log" "$root/android/app/build/outputs/apk/release/*.apk"
builds_ios && report ios "$ios_status" "$ios_log" "$root/ios/build/*.ipa"
echo

exit "$failed"
