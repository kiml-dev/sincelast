#!/usr/bin/env bash
# Janitor: runs the checks and files issues. Edits nothing.
source "$(dirname "$0")/lib.sh"
load_checks

run_loop loops/janitor.md \
  "${CHECKS[@]}" \
  "Bash(gh issue list:*)" "Bash(gh issue create:*)" \
  -- "$@"
