#!/usr/bin/env bash
# Planner phase 2: files the batch from the answered questions.
source "$(dirname "$0")/lib.sh"

run_loop loops/planner-issues.md \
  "Edit(docs/planning/batch-*.md)" \
  "Bash(gh issue list:*)" "Bash(gh issue create:*)" \
  -- "$@"
