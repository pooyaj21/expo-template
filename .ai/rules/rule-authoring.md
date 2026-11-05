---
description: "How AI rules and skills work in this repo — .ai/ is the single library; read before adding or editing any rule or skill"
globs: .ai/**
alwaysApply: false
paths:
  - ".ai/**"
---

# Authoring AI rules and skills

Claude Code and Cursor both read one library:

```
.ai/
  rules/<name>.md          rules (markdown + frontmatter)
  skills/<name>/SKILL.md   workflows (+ optional references/)

.claude/rules  -> ../.ai/rules     .cursor/rules/<name>.mdc -> ../../.ai/rules/<name>.md
.claude/skills -> ../.ai/skills    .cursor/skills -> ../.ai/skills
```

Everything in `.claude/` and `.cursor/` that points at `.ai/` is a symlink — no copies of rule bodies. Edit `.ai/` and both tools see it. Repo-level `CLAUDE.md` / `README.md` / `docs/` are human + agent orientation docs; they are not a substitute for scoped rules.

Why `.cursor/rules` is a folder of per-file links and not one folder link: Cursor only loads rule files named `*.mdc`, Claude Code only loads `*.md`. So each rule is `<name>.md` in `.ai/rules/`, and `.cursor/rules/<name>.mdc` is a link to it. `bash scripts/link-ai-rules.sh` creates the links; the husky pre-commit hook may run it with `--check`.

## Rule frontmatter

```yaml
---
description: "One sentence — what this covers and when it applies"
globs: src/features/**/data-access/**/*.{ts,tsx}
alwaysApply: false
paths:
  - "src/features/**/data-access/**/*.{ts,tsx}"
---
```

| Mode             | Frontmatter                                                           | Use for                                     |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| Always on        | `alwaysApply: true`, no `globs`, no `paths`                           | `general`, `localization` only              |
| Scoped (default) | `alwaysApply: false` + `globs` + `paths`                              | Rules for one folder or concern             |
| On demand        | `alwaysApply: false`, no `globs`; `paths` set to the files it governs | Reference material linked from `general.md` |

A rule with **no `paths`** is always loaded by Claude Code — only `general` and `localization` may omit it.

## Writing a rule

1. Find the owner: the index in `.ai/rules/general.md`, or grep the `globs:` lines. Prefer extending an existing section over a new file.
2. State the rule, then **why**, then a GOOD/BAD pair if the pattern is non-obvious.
3. Extract the pattern — don't paste large source blocks; they rot.
4. Reference files by project-root path (`src/features/example/data-access/exampleService.ts`).
5. New file → add it to the index in `general.md`, then run `bash scripts/link-ai-rules.sh`.

## Writing a skill

- `name` (kebab-case, same as the folder) and `description` frontmatter with trigger phrases.
- Steps, not essays: numbered, each one bounded. Point to the owning rule instead of repeating it.
- If every dev should know it, add it to the "Workflows (skills)" table in `general.md`.

## Don'ts

- ❌ Creating real `.cursor/rules/*.mdc` file bodies — they must be symlinks made by the script.
- ❌ Replacing a symlink with a real folder.
- ❌ `globs: **/*` or `alwaysApply: true` to avoid choosing a scope.
- ❌ Rules that restate Prettier / ESLint / TS config.
- ❌ Personal preferences (reply signatures, model routing) — those go in your own user config, never in the repo.
- ❌ Brand names from other products in rules or skills.
