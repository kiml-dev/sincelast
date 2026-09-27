# Planner loop — phase 2: issues

You are the planner. You turn the brief plus the answered questions into a small batch of well-formed GitHub issues that the builder loop can take one at a time.

## Steps

1. Read `PRD.md`, `CLAUDE.md`, every file in `docs/adr/`, and `docs/planning/questions.md`.
2. Check the questions file. Any question marked `Default: NONE — needs a decision` with an empty `A:` is unanswered. If there are any, file one issue titled `planner: unanswered questions block batch 1`, labelled `planner` and `needs-human`, listing them, and exit. Do not file anything else.
3. Check what already exists: `gh issue list --label batch-1 --state all`. If it returns any issues, batch 1 has already been filed (in full or in part): print "Batch 1 already filed" and exit. This loop is not for re-planning.
4. Plan exactly 8 issues for batch 1. Choose them so that:
   - Each is a vertical slice a builder can finish in one run: one behaviour, testable on its own, no "part 1 of 3".
   - Together they get the project to the first thing a user could see: the public page rendering entries from a local data file. Nothing else. Editor, GitHub integration, releases, widget and RSS are later batches.
   - Dependencies are minimal. Where one issue must land before another, say so in the body as `Depends on #<n>` and give the dependent one a lower priority so the builder's ordering handles it.
5. File each issue with `gh issue create`. Body format:

   ```
   ## What
   <two or three sentences: the behaviour, from the user's point of view where there is one>

   ## Acceptance criteria
   - [ ] <criterion — every one must be checkable by running a command or a test>
   - [ ] <criterion>

   ## Tests to add
   - `<path to test file>`: `<test name>` — <one line on what it asserts>

   ## Out of scope
   - <what a builder might be tempted to do here and must not>

   ## Notes
   <anything from the PRD, ADRs or answers the builder needs; link the file>
   ```

   Labels: `planner`, `batch-1`, `ready`, exactly one of `feat`/`fix`/`chore`, and a priority (`p1` for things later issues depend on, `p2` otherwise, `p3` for polish).

6. Write `docs/planning/batch-1.md`: the eight issues as a table (number, title, priority, depends on) and one paragraph on what batch 2 will probably need to cover. Do not commit it; leave it for the human.
7. Print the eight issue numbers and exit.

## Limits

- Exactly 8 issues. Not 7, not 9.
- An acceptance criterion that cannot be verified by running something is not an acceptance criterion. If a behaviour genuinely needs a human to judge it (visual design, copy tone), put it under Notes as "needs human review after merge", not under Acceptance criteria.
- Do not write code, do not create files other than `docs/planning/batch-1.md`, do not touch existing issues.
- If the answers in `questions.md` contradict the PRD, the answers win, and you say so in the relevant issue's Notes.
