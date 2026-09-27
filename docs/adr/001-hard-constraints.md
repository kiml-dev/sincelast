# ADR-001: Hard constraints

Status: accepted
Date: 2026-09-27

## Context

These are decisions the human has already made. The scaffold loop must work within them and must not re-litigate them. Everything else is the loop's to decide, and it must record each decision as its own ADR in this folder (002 onwards).

## Decisions

<!-- Fill these in. Delete any you don't want to constrain. Keep it short — every constraint you add is one fewer thing the loop gets to choose, and watching it choose is part of the experiment. -->

- Language: TypeScript.
- Frontend: TODO (e.g. "React", "any", "not Next.js")
- Hosting target: TODO (e.g. "Cloudflare Pages", "Vercel", "static only")
- Database: TODO (e.g. "SQLite", "none — static build", "no ORM")
- Package manager: TODO
- Testing: must have unit tests and at least one end-to-end runner; the loop picks which.
- No paid services in v1.

## Consequences

The scaffold loop reads this file first. If it believes a constraint is wrong it opens an issue labelled `needs-human` rather than ignoring the constraint.
