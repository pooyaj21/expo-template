---
name: rn-rules
description: Add or change a project rule, convention, trap or skill for the whole team (Claude Code and Cursor) — everything lives in .ai/. Use when asked to "add a rule", "remember this for the project", "record this trap", or to create or edit a skill.
---

# expo-template — add or change a rule or skill

Claude Code and Cursor read the same library, `.ai/`, through symlinks (`.claude/rules`, `.claude/skills`, `.cursor/skills`, and one `.cursor/rules/<name>.mdc` link per rule — Cursor only loads `.mdc`). Edit `.ai/` and both tools see the change. Full reference: `.ai/rules/rule-authoring.md`.

## Change an existing rule

1. Find the owner: the index in `.ai/rules/general.md`, or `rg -n "^globs:" .ai/rules`.
2. Edit `.ai/rules/<name>.md`: the rule, then **why** (the incident or constraint), then a ✅/❌ pair if the pattern is non-obvious.

## Add a rule file

1. Create `.ai/rules/<name>.md` with frontmatter for both tools — `globs` (Cursor) and `paths` (Claude Code) list the same files.
2. Add it to the index in `general.md`.
3. Run `bash scripts/link-ai-rules.sh` and stage the new `.cursor/rules/<name>.mdc` symlink.

## Add or change a skill

1. `.ai/skills/<name>/SKILL.md` with `name` + `description` frontmatter (description = trigger phrases).
2. Steps, not essays. Point at the owning rule instead of repeating it.
3. If every dev should know it, add it to the Workflows table in `general.md`.

## Don'ts

- ❌ Creating `CLAUDE.md`, `.cursorrules`, or real `.cursor/rules/*.mdc` files
- ❌ Replacing a symlink with a real folder
- ❌ Personal preferences in the repo — those belong in `~/.claude/CLAUDE.md` / Cursor user rules
