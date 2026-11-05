---
name: rules
description: Add or change a project rule, convention, trap or skill — everything lives in .ai/. Use when asked to add a rule, remember this for the project, record this trap, or create/edit a skill.
---

# Add or change a rule or skill

Full reference: `.ai/rules/rule-authoring.md`.

## Change an existing rule

1. Find the owner: index in `.ai/rules/general.md`, or `grep -n "^globs:" .ai/rules/*.md`.
2. Edit `.ai/rules/<name>.md`: the rule, then why, then a GOOD/BAD pair if needed.

## Add a rule file

1. Create `.ai/rules/<name>.md` with frontmatter (`globs` + `paths` covering the same files).
2. Add a line to the index in `general.md`.
3. `bash scripts/link-ai-rules.sh`.

## Add or change a skill

1. Create / edit `.ai/skills/<name>/SKILL.md` with matching `name` and trigger-rich `description`.
2. Numbered steps that point at the owning rule.
3. Add to the workflows table in `general.md` when every contributor should know it.

## Check

```bash
ls -la .claude .cursor .cursor/rules
bash scripts/link-ai-rules.sh --check
```

Every entry pointing at `.ai` must be a symlink.
