#!/usr/bin/env bash
# Cursor only loads rules named *.mdc; Claude Code only loads *.md. Rules live
# once in .ai/rules/*.md and .cursor/rules/ holds one <name>.mdc symlink per
# rule. Claude Code also gets .claude/rules → .ai/rules and
# .claude/skills → .ai/skills.
#
#   bash scripts/link-ai-rules.sh          # create / refresh links
#   bash scripts/link-ai-rules.sh --check  # exit 1 if links are missing or stale
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

expected() { for f in .ai/rules/*.md; do basename "$f" .md; done | sort; }
actual() { for f in .cursor/rules/*.mdc; do [ -L "$f" ] && basename "$f" .mdc; done 2>/dev/null | sort; }

link_claude() {
  mkdir -p .claude
  if [ -L .claude/rules ] || [ -e .claude/rules ]; then rm -rf .claude/rules; fi
  if [ -L .claude/skills ] || [ -e .claude/skills ]; then rm -rf .claude/skills; fi
  ln -s ../.ai/rules .claude/rules
  ln -s ../.ai/skills .claude/skills
}

check_claude() {
  [ -L .claude/rules ] && [ "$(readlink .claude/rules)" = "../.ai/rules" ] || return 1
  [ -L .claude/skills ] && [ "$(readlink .claude/skills)" = "../.ai/skills" ] || return 1
}

if [ "${1:-}" = "--check" ]; then
  if [ ! -d .cursor/rules ] || [ -L .cursor/rules ] || [ "$(expected)" != "$(actual)" ] || ! check_claude; then
    echo ".cursor/.claude AI links are out of step with .ai. Run:"
    echo "    bash scripts/link-ai-rules.sh && git add .cursor/rules .claude"
    exit 1
  fi
  exit 0
fi

[ -L .cursor/rules ] && rm .cursor/rules
mkdir -p .cursor/rules
find .cursor/rules -name '*.mdc' -type l -delete
for name in $(expected); do
  ln -s "../../.ai/rules/$name.md" ".cursor/rules/$name.mdc"
done
link_claude
echo "Linked $(expected | wc -l | tr -d ' ') rules into .cursor/rules and .claude/{rules,skills}"
