# Planning questions — batch 1

Answer inline after each `A:`. Leave an answer blank to accept the default.

Batch 1 scope (from `loops/planner-issues.md`): the public page rendering entries from a local data file. That's all. Questions below are limited to what changes those eight issues.

## Contradictions between PRD, ADRs and CLAUDE.md

### Q1. Can anything be plain JavaScript when ADR-001 says TypeScript?
`PRD.md` "What it does" item 6 says the widget is "written in plain JavaScript, not TypeScript, so it ships with no build step". `docs/adr/001-hard-constraints.md` "Decisions" says "Language: TypeScript" and gives no exceptions. The widget itself isn't in batch 1, but the public page's client-side script (if it has one) raises the same question.
Why it matters: it decides whether batch-1 page code is TypeScript compiled by a build step, or plain JS that ships as-is, and whether lint/typecheck issues must cover `.js` files.
Default: ADR-001 wins everywhere except the widget, which is a documented exception to add to ADR-001 later. All batch-1 code, including any page script, is TypeScript.
A: TypeScript everywhere, including the widget. The widget is compiled to plain JavaScript for the people embedding it; "no build step" meant on their side, not ours. PRD item 6 is fixed to say so, and ADR-001 records it.

### Q2. Hosted with a backend, or static?
The `PRD.md` "Open questions" offer "Hosted (needs a backend + DB)" as an option. `docs/adr/001-hard-constraints.md` rules out a database ("Database: none in v1. Data lives in files in the repo") and paid services. That leaves either static hosting or a backend with no database.
Why it matters: batch-1 issues are either "generate a static page from a file" or "serve a page from a server that reads a file". Those have different tests, entry points and out-of-scope lists.
Default: static. A data file in the repo is the source of truth, and the public page is static output with no server at runtime.
A: Static. No server at runtime in v1. ADR-001 now says so explicitly.

### Q3. Tag vocabulary: `feature` or `feat`?
`PRD.md` "What it does" item 2 names the entry tags `feature`, `fix`, `breaking`. Item 3, `CLAUDE.md` "Conventions" and `inferBump` in `src/index.ts` all use `feat` (and item 3 also has `chore`).
Why it matters: batch 1 defines the data-file schema. The tag enum and how each tag is labelled on the page are fixed there.
Default: the stored values are `feat`, `fix`, `breaking` and `chore`, matching `inferBump`. The page shows "Feature", "Fix" and "Breaking", and `chore` entries are hidden by default.
A: `feat`. The PRD is fixed. Otherwise the default stands.

### Q4. Is the bump inferred from PR labels or from conventional-commit titles?
`PRD.md` "What it does" item 3 says the bump comes from PR labels. `CLAUDE.md` "Conventions" says PR titles carry conventional-commit prefixes and "The changelog tool itself will read these". `PRD.md` "Done looks like" requires matching release-please, and release-please reads commit messages, not labels.
Why it matters: in batch 1, only the question of whether the data file stores raw labels, a parsed title prefix or both. Batch 2's GitHub integration depends on it entirely.
Default: store both fields on each entry (`labels: string[]` and `title` as written). Leave the inference-source decision to batch 2. `inferBump` stays unchanged in batch 1.
A: Conventional-commit PR titles. Labels are ignored for version inference for now. Titles are what the release-please parity test compares against, and the builder already writes them. The PRD is fixed, and ADR-001 records it.

## Data file

### Q5. Where does the data file live, and in what format?
Why it matters: every batch-1 issue reads it, so its path and format go into every acceptance criterion and test fixture.
Default: one JSON file, `data/changelog.json`, in this repo, with a TypeScript type and a runtime validator. An invalid file fails the build with a message naming the bad field.
A: `data/entries.json`, JSON.

### Q6. What fields does an entry and a release have?
Why it matters: it fixes the schema issue and what the page can render (for example, a PR link needs a PR URL field).
Default: a release has `version` (semver string), `date` (ISO 8601 date) and `entries`. An entry has `id`, `title`, `body`, `tag`, `hidden` (boolean), `prNumber`, `prUrl` and `labels`. Unreleased entries sit in a top-level `unreleased` array with the same entry shape.
A: One object per entry, in a flat list. Each entry carries its release `version` (null while unreleased) instead of being nested inside a release object.

### Q7. Is entry `body` plain text or Markdown?
Why it matters: Markdown needs a renderer and HTML sanitization. That's its own issue with XSS tests. Plain text needs only escaping.
Default: plain text, HTML-escaped, with paragraphs split on blank lines. Markdown is deferred.
A: Markdown, rendered at build time and sanitised.

## Public page

### Q8. Which entries appear on the public page?
Why it matters: it sets the filtering logic and its tests.
Default: only released versions appear, newest first. Entries marked `hidden` never render. The `unreleased` bucket never appears on the public page. With no releases, the page shows a short empty-state message.
A:

### Q9. Is the page generated at build time, or does it fetch the data file in the browser?
Why it matters: either the tests assert on generated HTML with no JS needed, or on DOM after a fetch. That also changes how the PRD's "under 1s on slow 3G" and a11y targets are tested.
Default: generated at build time into static HTML, readable with JavaScript disabled. The output is written where `npm run a11y` already points (`public/index.html`), replacing the current placeholder.
A:

### Q10. Which of the PRD's quality targets are batch-1 acceptance criteria?
`PRD.md` "Done looks like" asks for automated a11y checks to pass and a load time under 1s on slow 3G. `npm run a11y` (pa11y) exists already. Nothing measures load time yet.
Why it matters: it decides whether batch 1 includes an issue to build a performance check, or only adds criteria on existing checks.
Default: `npm run a11y` passing on the generated page is an acceptance criterion. The 3G load-time check is deferred to a later batch. Batch 1 limits itself to a page-weight budget: no client JS, no web fonts, total HTML+CSS under 50 KB, checked by a test.
A: Both count in batch 1: `npm run a11y` passing on the generated page, and a real slow-3G load-time check against the PRD's under-1s target.

## Tooling and ordering

### Q11. Should batch 1 wait for the scaffold loop, or build on the current stack?
`PLAN.md` puts the planner (loop 4) ahead of the scaffold (loop 5). `docs/adr/001-hard-constraints.md` leaves the e2e runner and the rest of the stack to the scaffold loop, and no ADR-002+ exists yet. The repo currently has TypeScript, ESLint, Vitest and pa11y.
Why it matters: if issues may add dependencies (a templating library, an e2e runner), the builder is making stack decisions that ADR-001 reserves for the scaffold loop. If they may not, some slices must be done with Node built-ins.
Default: batch 1 uses only the current dependencies plus Node built-ins. Any issue that needs a new dependency is out of scope for batch 1. E2e tests are deferred until the scaffold loop has picked a runner. Unit tests (Vitest) and `npm run a11y` are the oracle.
A: Batch 1 may add dev dependencies for tooling (for example a Markdown renderer or a load-time checker), but no UI framework. A script that turns JSON into HTML needs none. The scaffold loop picks the framework when there is an editor to build. ADR-001 records this.

### Q12. What data does the page ship with?
Why it matters: it decides whether one issue seeds `data/changelog.json` with this repo's real history (dogfooding, per `PRD.md` "Done looks like") or only with a synthetic sample, and what the fixtures look like.
Default: tests use synthetic fixtures under `test/fixtures/`. The committed `data/changelog.json` gets a small hand-written sample (two releases, one hidden entry, one unreleased entry), clearly marked as sample data. Dogfooding real history waits for the GitHub integration.
A: Synthetic sample data. This repo's history is mostly loop plumbing.

## Deferred (not needed for batch 1)

- How "a single GitHub login" (PRD "Out of scope") works with no backend. OAuth needs a server or a device flow.
- Where the editor persists changes: commits to the repo, a PR per edit, or local only.
- Widget delivery: iframe or web component (PRD "Open questions").
- RSS vs Atom, feed URL, and how many items to include.
- Hosting target and base path (GitHub Pages or another free host).
- Pre-1.0 bump behaviour: release-please bumps minor, not major, for breaking changes below 1.0.0.
- Whether `chore`-only releases get a release at all. release-please doesn't release them; the PRD says patch.
- Source and format of the 20 sample PRs for the release-please parity test.
- Tagging and GitHub release creation flow, including who runs it and with which token.
- The "connect repo in under ten minutes" onboarding path and how it is measured.
- Date and locale formatting on the public page.
