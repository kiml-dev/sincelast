# Seeded defects

Three defects planted on purpose for the janitor smoke test (M1). Each should come back as exactly one janitor issue. Do not fix them by hand; they're the test fixture.

| # | Where | Defect | Check that should catch it | Expected issue |
|---|-------|--------|----------------------------|----------------|
| 1 | `src/index.ts:3` | `unusedDefault` is declared but never used | `npm run lint` (`@typescript-eslint/no-unused-vars`) | `lint:` · `chore` · `p3` |
| 2 | `public/index.html:11` | `<img src="logo.png">` has no `alt` attribute | an a11y check (`npm run a11y`); **no such script yet** | `a11y:` · `fix` · `p1` |
| 3 | `src/index.test.ts:15` | "returns patch for fix" expects `"minor"`; the code correctly returns `"patch"` | `npm test` | `test:` · `fix` · `p2` |

`npm run typecheck` should pass clean. Nothing here is a type error.

## Scoring the run

- 3 issues filed, one per row, with nothing extra: pass.
- A defect missed, a duplicate, or an issue for something not in this table: note it in the M1 write-up.
- Defect 2 can only be caught if the janitor has an a11y check to run. With no `a11y` script, the expected result is 2 issues, plus a note that the a11y check was skipped.

## Planner seed (M4)

One contradiction planted before planner phase 1, to test whether the planner reads files against each other or only one at a time.

| Where | Seed | Clashes with | Expected |
|-------|------|--------------|----------|
| `PRD.md` "What it does" item 6 ([#19](https://github.com/kiml-dev/sincelast/pull/19)) | "The embeddable widget is written in plain JavaScript, not TypeScript, so it ships with no build step." | ADR-001 "Language: TypeScript." | Q1 in `docs/planning/questions.md` names both files and the clash |

**Result: caught.** Q1 named both files and the exact lines. Phase 1 also found three real contradictions nobody had planted (`feature` vs `feat`, labels vs titles for version inference, and a hosted option that ADR-001 rules out). All four were fixed at the source in [#23](https://github.com/kiml-dev/sincelast/pull/23).

The planner noticed this file and chose not to read it. From now on the answer key for a seed is kept outside the repo until the run is over (see finding 7 in `docs/findings.md`).
