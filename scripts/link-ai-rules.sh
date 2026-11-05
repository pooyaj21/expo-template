#!/usr/bin/env bash
# Cursor only loads rules named *.mdc; Claude Code only loads *.md. Rules live
# once in .ai/rules/*.md and .cursor/rules/ holds one <name>.mdc symlink per
# rule. This keeps those links in step with .ai/rules/.
#
#   bash scripts/link-ai-rules.sh          # create / remove links
#   bash scripts/link-ai-rules.sh --check  # exit 1 if links are missing or stale (pre-commit)
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

expected() { for f in .ai/rules/*.md; do basename "$f" .md; done | sort; }
actual() { for f in .cursor/rules/*.mdc; do [ -L "$f" ] && basename "$f" .mdc; done 2>/dev/null | sort; }

if [ "${1:-}" = "--check" ]; then
  if [ ! -d .cursor/rules ] || [ -L .cursor/rules ] || [ "$(expected)" != "$(actual)" ]; then
    echo ".cursor/rules links are out of step with .ai/rules. Run:"
    echo "    bash scripts/link-ai-rules.sh && git add .cursor/rules"
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
echo "Linked $(expected | wc -l | tr -d ' ') rules into .cursor/rules"
