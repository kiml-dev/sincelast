# CLAUDE.md

This repo (`kiml-dev/sincelast`) is a loop-engineering experiment. The product is `sincelast`, a changelog tool (see `PRD.md`); the point is the chain of agent loops that build it (see `PLAN.md`).

## Read first

- `PRD.md` — what we are building and what "done" means.
- `PLAN.md` — the loops, their order, and the milestones.
- `docs/adr/` — architecture decisions. `001` is human-set and not up for debate. Later ADRs were written by the scaffold loop; read them before touching structure, and add a new one if you change a decision.
- `loops/` — one prompt file per loop. If you are running as a loop, your prompt is there and it is your only instruction beyond this file.

## Rules for every loop

- Do one thing, write your state to GitHub (labels, issues, PRs), then exit. Do not continue past your defined output.
- Labels are the state machine: `ready` → `in-progress` → PR open → merged. Use `blocked` after a bounded number of failed attempts and `needs-human` for anything you should not decide alone.
- Never force-push, never merge, never delete branches. Humans merge.
- Tests are the oracle. If there are no tests for what you changed, write them before you call it done.
- Run the full check suite (`lint`, `typecheck`, `test`) before opening a PR. Say in the PR body what you ran and what the result was.
- If you hit the same error three times, stop, label `blocked`, and describe what you tried.
- Commit small. One issue per branch, one branch per PR.

## Conventions

- Branch names: `<issue-number>-<short-slug>`.
- PR titles carry a conventional-commit prefix (`feat:`, `fix:`, `chore:`, `docs:`) and a `!` for breaking changes. The changelog tool itself will read these.
- Issues carry exactly one of `feat`, `fix`, `chore` plus a priority (`p1`, `p2`, `p3`).

## Labels to create on the repo

`ready`, `in-progress`, `blocked`, `needs-human`, `feat`, `fix`, `chore`, `breaking`, `p1`, `p2`, `p3`, `janitor`, `planner`, `review:approved`, `review:changes`, `batch-1`
