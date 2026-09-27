#!/usr/bin/env bash
# Builder: takes one ready issue to a PR. Edits code, never merges.
source "$(dirname "$0")/lib.sh"
load_checks

run_loop loops/builder.md \
  "Edit(src/**)" "Edit(test/**)" "Edit(data/**)" "Edit(public/**)" "Edit(.loop/**)" \
  "Edit(package.json)" "Edit(package-lock.json)" "Edit(tsconfig.json)" "Edit(eslint.config.js)" \
  "Bash(git checkout:*)" "Bash(git pull)" "Bash(git status:*)" "Bash(git diff:*)" "Bash(git log:*)" \
  "Bash(git add:*)" "Bash(git commit:*)" "Bash(git push:*)" \
  "Bash(npm ci)" "Bash(npm install:*)" "Bash(npm test:*)" "Bash(npm run build)" \
  "${CHECKS[@]}" \
  "Bash(gh issue list:*)" "Bash(gh issue view:*)" "Bash(gh issue edit:*)" \
  "Bash(gh issue comment:*)" "Bash(gh issue create:*)" "Bash(gh pr create:*)" \
  -- "$@"
