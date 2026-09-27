# Loop Engineering Plan

Goal: build the changelog tool (see PRD.md) end-to-end using a chain of small agent loops, and learn what works. The app is the test subject; the loops are the point.

## Principles

- Each loop reads state, does one thing, writes state, exits. No conversation carried between stages.
- Shared state lives in the repo and GitHub. Labels are the state machine: `ready`, `in-progress`, `blocked`, `needs-human`.
- Every loop is idempotent and bounded (max iterations, max cost) with an escape hatch to a human.
- Tests are the only oracle the fix loop has. Every issue ships with acceptance criteria and test stubs.
- The loop writes ADRs; the human only writes hard constraints (see docs/adr/).

## Loops

| # | Loop | Input | Output | Human gate |
|---|------|-------|--------|------------|
| 1 | Janitor | repo (lint, a11y, types, tests) | tagged GitHub issues | none |
| 2 | Builder | one `ready` issue | branch + PR, or `blocked` label after N attempts | none |
| 3 | Reviewer | open PR | review comments / approval | human merges |
| 4 | Planner | PRD.md + questionnaire | tagged issues with acceptance criteria + test stubs | human reviews issues |
| 5 | Scaffold | ADR-001 constraints | installed stack + ADR-002..n explaining choices | human reviews ADRs |

Build order: 1 → 2 → 3 → 4 → 5. Start with the janitor because it is smallest and useful on day one.

## Milestones

- [ ] M0 — Repo exists on GitHub with these files, `gh` authenticated, labels created.
- [ ] M1 — Janitor loop files its first issue from a lint run.
- [ ] M2 — Builder loop turns one janitor issue into a merged PR.
- [ ] M3 — Reviewer loop leaves a useful review on a builder PR.
- [ ] M4 — Planner loop turns PRD.md into a first batch of issues you'd actually accept.
- [ ] M5 — Scaffold loop picks and installs a stack within ADR-001 constraints.
- [ ] M6 — Full chain runs unattended on a schedule for one week; count `needs-human` escalations.

## Driver

Each loop is a Claude Code headless run (`claude -p`) triggered by a GitHub Action or a scheduled task. `gh` CLI handles issues, PRs and releases. Loop prompts live in `loops/<name>.md`.

## Later

- Self-improving variant: let a loop propose changes to `loops/*.md` via PR. Only after M6.
- Spin the loops out as a template repo + write-up for tiny teams.
