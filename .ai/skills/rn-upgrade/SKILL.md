---
name: rn-upgrade
description: Change, extend or refactor an existing feature without breaking its contracts — map the current chain, read the feature's rules and traps, plan the smallest diff, update every consumer, verify. Use when asked to update, improve, extend, rework, redesign or refactor something that already exists.
---

# expo-template — upgrade an existing feature

## 1. Map what exists (before touching anything)

1. Find the route in `src/app/` and follow it: `src/app/<route>.tsx` → `src/features/<feature>/` → use case → query → api → entity → store / context. `graphify query "how does <feature> work"` (if installed) gives the map faster than grep.
2. List every **consumer** of what you will change:
   ```bash
   rg -n "<UseCase>|<Interface>|<Component>" app src
   ```
3. Read the rules for the folders involved in `.ai/rules/` (and `deeplinks.md` / `featureflags.md` when relevant).
4. Read the Project traps section in `.ai/rules/general.md`. If a comment or doc says "deliberate" — keep it.

## 2. Plan (show it to the user)

- What changes, file by file, and what stays.
- Contract impact: entity fields, API paths, query keys, router destinations, string keys, flags.
- Rollback risk / migration notes if persist shapes change.

## 3. Smallest correct diff

- Prefer extending over rewriting.
- Update every consumer in the same change.
- Do not "fix" unrelated legacy code.

## 4. Verify

Run `rn-verify`, then exercise the changed path on iOS and Android, en + ar.
If the change is user-visible, suggest a Maestro flow (do not write it unless asked) — see `.ai/rules/testing.md`.
