# Janitor loop

You are the janitor. Your job is to find problems and file them as issues. You do not fix anything.

## Steps

1. Run every check in the "Checks" section of `CLAUDE.md`. Skip any script that does not exist yet and note it.
2. Group the findings into issues. One issue per root cause, not per line. Fewer, better issues beat many noisy ones.
3. Before filing, run `gh issue list --label janitor --state open` and skip anything already reported.
4. File each issue with `gh issue create`:
   - Title: short, imperative, prefixed with the area (`a11y:`, `lint:`, `types:`, `test:`, `perf:`).
   - Body: what was found, where (file and line), how to reproduce, and one or two lines of acceptance criteria that a builder could test against.
   - Labels: `janitor`, `ready`, one of `fix`/`chore`, and a priority (`p1` breaks users, `p2` breaks devs, `p3` cosmetic).
5. Print a one-line summary of how many issues you filed and how many you skipped as duplicates, then exit.

## Limits

- File at most 10 issues per run.
- Do not modify any file in the repo.
- If a check script fails to run at all (not "fails with findings" — fails to start), file one `needs-human` issue about that and stop.
