#!/usr/bin/env bash
# Reviewer: checks open PRs and records a verdict. Read-only apart from comments and labels.
source "$(dirname "$0")/lib.sh"
load_checks

run_loop loops/reviewer.md \
  "Bash(npm ci)" "${CHECKS[@]}" \
  "Bash(git checkout main)" "Bash(git status:*)" "Bash(git diff:*)" \
  "Bash(gh pr list:*)" "Bash(gh pr view:*)" "Bash(gh pr diff:*)" "Bash(gh pr checkout:*)" \
  "Bash(gh pr comment:*)" "Bash(gh pr edit:*)" "Bash(gh issue view:*)" "Bash(gh issue edit:*)" \
  -- "$@"
