#!/usr/bin/env bash
# Planner phase 1: writes docs/planning/questions.md. No Bash at all.
source "$(dirname "$0")/lib.sh"

run_loop loops/planner-questions.md \
  "Edit(docs/planning/questions.md)" \
  -- "$@"
