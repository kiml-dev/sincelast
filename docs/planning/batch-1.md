# Batch 1 — public page from a local data file

Filed by the planner loop on 2026-09-27. The goal: `npm run build` turns `data/entries.json` into a static, accessible `public/index.html` that loads in under 1 s on slow 3G.

| # | Title | Priority | Depends on |
|---|-------|----------|------------|
| #24 | feat: entry schema and validator for data/entries.json | p1 | — |
| #25 | feat: render entry Markdown to sanitised HTML | p1 | — |
| #26 | chore: add a slow-3G load-time check for the public page | p1 | — |
| #27 | feat: choose which releases and entries the public page shows | p2 | #24 |
| #28 | chore: add synthetic sample data in data/entries.json | p2 | #24 |
| #29 | feat: render the public changelog page as static HTML | p2 | #24, #25 |
| #30 | feat: build public/index.html from data/entries.json | p3 | #27, #28, #29 |
| #31 | chore: check the generated page, not a stale copy, in a11y and perf | p3 | #26, #30 |

Issues were filed in dependency order, so the builder's "priority, then oldest" rule picks them in a workable order. The builder doesn't wait for a dependency's PR to be merged before starting the next issue, though. Merge each tier (p1, then p2, then p3) before letting the builder pick up the next one, or it will build a p2 issue on a `main` that lacks its p1 dependency.

Things to check when reviewing:

- **#26's network profile.** DevTools' "Slow 3G" preset adds about 2000 ms latency per request, so no page could load in under 1 s on it. The issue specifies WebPageTest's "3G Slow" profile instead: 400 kbps, 400 ms RTT. Confirm that's what the PRD means.
- **#28, one confusing line.** Under "Out of scope", it tells the builder to "comment on #24's follow-up" if the schema lacks a field. Read that as "relabel `needs-human` and say which field is missing". The loop couldn't edit the issue after filing it.
- **Blank answers.** Q8 and Q9 were left blank, so their defaults were used: only released, non-hidden, non-chore entries appear; the page is generated at build time with no client JS.
- **Answers that override the PRD.** Q7: Markdown bodies. Q3: `chore` is a stored tag. The issues' Notes say where this applies.

## Batch 2, probably

Batch 2 should connect the data file to GitHub. That means a GitHub Action (static hosting, no runtime server) that turns merged PRs into draft entries with `version: null`. It also means rewriting `inferBump` in `src/index.ts` to read conventional-commit PR titles instead of labels (Q4, ADR-001), plus the 20-PR release-please parity test and a decision on pre-1.0 and chore-only bumps. The release step goes with it: tag the repo, create the GitHub release, and stamp `version`/`releasedAt` onto entries. Hosting (GitHub Pages and base path), the RSS feed, and date formatting on the page are the other likely candidates. The editor and widget need the scaffold loop's framework ADR first, and probably a `needs-human` decision on how "a single GitHub login" works with no backend.
