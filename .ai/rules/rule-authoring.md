---
description: "How AI rules and skills work in this repo — .ai/ is the single library for Claude Code and Cursor; read before adding or editing any rule or skill"
globs: .ai/**
alwaysApply: false
paths:
  - ".ai/**"
---

# Authoring AI rules and skills

The team uses **Claude Code and Cursor**. Both read one library:

```
.ai/
  rules/<name>.md          rules (markdown + frontmatter)
  skills/<name>/SKILL.md   workflows (+ optional references/)

.claude/rules  -> ../.ai/rules     .cursor/rules/<name>.mdc -> ../../.ai/rules/<name>.md
.claude/skills -> ../.ai/skills    .cursor/skills -> ../.ai/skills
```

Everything in `.ai/rules/` and `.cursor/` that points at `.ai/` is a symlink — no `.ai/rules/` files, no copies. Edit `.ai/` and both tools see it.

Why `.cursor/rules` is a folder of per-file links and not one folder link: Cursor only loads rule files named `*.mdc`, Claude Code only loads `*.md` (both verified with the CLIs). So each rule is `<name>.md` in `.ai/rules/`, and `.cursor/rules/<name>.mdc` is a link to it. `bash scripts/link-ai-rules.sh` creates the links; the husky pre-commit hook runs it with `--check`. `.ai/rules/settings.json` and `.ai/rules/hooks/` are Claude-only tool config, not rules.

## Rule frontmatter

Each rule carries the loading instructions for **both** tools. Cursor reads `description` / `globs` / `alwaysApply`; Claude Code reads `paths`. Keep `globs` and `paths` covering the same files.

```yaml
---
description: "One sentence — what this covers and when it applies"
globs: src/common/data-access/api/**/*.{ts,tsx} # Cursor: comma-separated, no spaces
alwaysApply: false
paths: # Claude Code: same patterns as a list
  - "src/common/data-access/api/**/*.{ts,tsx}"
---
```

| Mode             | Frontmatter                                                           | Use for                                                                                                                            |
| ---------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Always on        | `alwaysApply: true`, no `globs`, no `paths`                           | `general`, `localization` only. Every line is paid on every request — keep them tight.                                             |
| Scoped (default) | `alwaysApply: false` + `globs` + `paths`                              | Rules for one folder or one feature's files. Loaded when the AI works on a matching file.                                          |
| On demand        | `alwaysApply: false`, no `globs`; `paths` set to the files it governs | Reference material. Cursor fetches it by `description`; Claude loads it on matching files. Link it from the index in `general.md`. |

A rule with **no `paths`** is always loaded by Claude Code — only `general` and `localization` may omit it.

## Writing a rule

1. Find the owner: the index in `.ai/rules/general.md`, or grep the `globs:` lines. Prefer extending an existing section over a new file.
2. State the rule, then **why** (the incident or constraint), then a ✅/❌ pair if the pattern is non-obvious.
3. Extract the pattern — don't paste large source blocks; they rot.
4. Reference files by project-root path (`src/features/*/data-access/brandApi.ts`), never by relative path in prose.
5. New file → add it to the index in `general.md`, then run `bash scripts/link-ai-rules.sh` (adds its `.mdc` link for Cursor). Same after deleting or renaming a rule.

## Writing a skill

- `name` (kebab-case, same as the folder) and `description` frontmatter. The description decides when the AI picks the skill up — list the trigger phrases.
- Steps, not essays: numbered, each one bounded. Point to the owning rule instead of repeating it.
- If every dev should know it, add it to the "Workflows (skills)" table in `general.md` and in the Workflows table in `general.md`.

## Don'ts

- ❌ Creating `.ai/rules/`, `.cursorrules` or real `.cursor/rules/*.mdc` files — everything goes in `.ai/`; the `.mdc` entries are links made by the script.
- ❌ Replacing a symlink with a real folder. If `.ai/rules/rules` shows up as a text file, the clone lacks symlink support (Windows: `git config --global core.symlinks true` + Developer Mode, then re-clone).
- ❌ `globs: **/*` or `alwaysApply: true` to avoid choosing a scope.
- ❌ Rules that restate Prettier / ESLint / TS config.
- ❌ Personal preferences (reply signatures, model routing, formatting styles) — those go in your own `~/.claude/.ai/rules/` or Cursor user rules, never in the repo.
