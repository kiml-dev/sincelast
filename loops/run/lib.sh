# Shared helpers for the loop run scripts. Sourced, not executed.
set -euo pipefail

ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)"
cd "$ROOT"

# Tools every loop may use.
BASE_TOOLS=(Read Glob Grep)

# Never allowed, whatever a loop's allowlist says. Deny rules win over allow rules.
DENY_TOOLS=(
  "Bash(git push --force:*)"
  "Bash(git push -f:*)"
  "Bash(git push origin main:*)"
  "Bash(gh pr merge:*)"
)

# One Bash(...) rule per check in the "Checks" section of CLAUDE.md, which is
# the single list of checks. Fails if the section is missing or empty.
check_tools() {
  local checks
  checks="$(awk '/^## Checks/{f=1; next} /^## /{f=0} f' CLAUDE.md \
    | sed -nE 's/^[0-9]+\. `(npm [^`]+)`.*$/\1/p')"
  if [[ -z "$checks" ]]; then
    echo "loops/run: no checks found in the \"Checks\" section of CLAUDE.md" >&2
    exit 1
  fi
  while IFS= read -r c; do printf 'Bash(%s)\n' "$c"; done <<< "$checks"
}

# Sets the CHECKS array from check_tools. Works on macOS's bash 3.2 (no mapfile),
# and exits if check_tools fails.
load_checks() {
  local raw line
  raw="$(check_tools)" || exit 1
  CHECKS=()
  while IFS= read -r line; do CHECKS+=("$line"); done <<< "$raw"
}

# run_loop <prompt file> <allowed tool>... [-- <extra claude args>...]
# Set LOOP_DRY_RUN=1 to print the command instead of running it.
run_loop() {
  local prompt="$1"; shift
  local allowed=("${BASE_TOOLS[@]}")
  while [[ $# -gt 0 && "$1" != "--" ]]; do allowed+=("$1"); shift; done
  [[ "${1:-}" == "--" ]] && shift

  local allowed_csv deny_csv
  allowed_csv="$(IFS=,; echo "${allowed[*]}")"
  deny_csv="$(IFS=,; echo "${DENY_TOOLS[*]}")"

  if [[ -n "${LOOP_DRY_RUN:-}" ]]; then
    printf 'claude -p "$(cat %s)" \\\n  --allowedTools %q \\\n  --disallowedTools %q' "$prompt" "$allowed_csv" "$deny_csv"
    [[ $# -gt 0 ]] && printf ' %q' "$@"
    printf '\n'
    return
  fi
  claude -p "$(cat "$prompt")" --allowedTools "$allowed_csv" --disallowedTools "$deny_csv" "$@"
}
