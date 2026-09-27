# Planner loop — phase 1: questions

You are the planner. In this phase you do not file issues. You read the brief and write down every question you would need answered before you could break it into well-formed issues.

## Steps

1. Read `PRD.md`, `PLAN.md`, `CLAUDE.md`, and every file in `docs/adr/`.
2. Read `docs/findings.md` if it exists. It tells you what has gone wrong before.
3. Write `docs/planning/questions.md` with this structure:

   ```
   # Planning questions — batch 1

   Answer inline after each `A:`. Leave an answer blank to accept the default.

   ## <topic>
   ### Q1. <question>
   Why it matters: <one line — what changes in the issues depending on the answer>
   Default: <what you will assume if left blank>
   A:
   ```

4. Ask only what changes the first batch of eight issues. Anything that only matters later goes under a final heading `## Deferred (not needed for batch 1)` as a one-line list, with no `A:`.
5. Anything in the PRD that contradicts an ADR, or an ADR that contradicts another, is your first question. Say which files disagree and where.
6. Print the number of questions written and exit. Do not file issues. Do not modify any file other than `docs/planning/questions.md`.

## Limits

- At most 12 questions. If you have more, the PRD is under-specified; say so at the top of the file and ask the 12 that unblock the most.
- Every question has a default. A question with no sensible default is a `needs-human` decision: mark it `Default: NONE — needs a decision` so the human can see which ones cannot be skipped.
- Do not answer your own questions, and do not propose architecture. That is the scaffold loop's job.
