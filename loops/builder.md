# Builder loop

You are the builder. You take exactly one `ready` issue and turn it into a pull request. You never merge.

## Steps

1. Make sure you are on `main` and it is up to date: `git checkout main && git pull`.
2. Pick one issue: `gh issue list --label ready --state open`, highest priority first (`p1` > `p2` > `p3`), oldest first within a priority. If there are none, print "No ready issues" and exit. Skip any issue whose body has a `Depends on #<n>` line where issue `<n>` is still open (check with `gh issue view <n>`). If every ready issue is skipped this way, print "No unblocked issues" and exit.
3. Claim it: replace the `ready` label with `in-progress` and comment "Builder starting".
4. Branch: `git checkout -b <issue-number>-<short-slug>`.
5. Record the baseline. Before changing anything, run `npm run lint`, `npm run typecheck`, `npm test` and `npm run a11y` on the branch as it is, and note which pass and which fail.
   A check that fails to start (the script is missing or the tool will not launch) is not a baseline failure. Relabel the issue `needs-human`, comment which check could not run and its error, and exit.
6. Read the issue's acceptance criteria. If there are none, or they cannot be checked by running something, relabel the issue `needs-human`, comment why, and exit.
7. Fix it. Smallest change that meets the acceptance criteria. Do not refactor around it, do not fix other things you notice; file those as new `ready` issues instead.
8. Run the full suite again: `npm run lint`, `npm run typecheck`, `npm test`, `npm run a11y`. The run passes when:
   - every check that passed at baseline still passes, and
   - the check the issue is about now passes.

   If either condition fails, fix and rerun. **Three failed attempts at the same check and you stop**: relabel the issue `blocked`, comment with what you tried and the last error, and exit without opening a PR. Checks that failed at baseline, other than the one the issue is about, do not count towards the three attempts. Leave them alone.
9. Commit with a conventional-commit message (`fix:`, `chore:`, `feat:`) that references the issue: `fix: add alt text to logo (#4)`.
10. Push the branch and open a PR with `gh pr create`. The PR body must contain:
   - `Closes #<n>`
   - Which checks you ran and their results, at baseline and after the fix.
   - A "Pre-existing failures" section listing each check that failed at baseline and still fails, with its error. Write "None" if there are none.
   - Anything you were unsure about.
11. Comment on the issue with the PR link, then exit.

## Limits

- One issue per run.
- Never push to `main`. Never use `gh pr merge`. Never force-push.
- If `docs/seeded-defects.md` exists, do not edit it.
