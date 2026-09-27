# PRD — Changelog Tool

## Problem

Tiny teams (1–5 people) ship constantly but rarely tell users what changed. Writing release notes by hand is the first thing dropped. Existing tools (Headway, Beamer) are built for marketing teams; release bots (release-please) write for developers, not users.

## Users

- A solo developer or tiny team shipping a web product via GitHub.
- Their users, who see a "what's new" page or widget.

## What it does

1. Connects to a GitHub repo. Merged PRs become **draft entries** in an "Unreleased" bucket.
2. An editor lets the team rewrite drafts in plain language, tag them (`feature`, `fix`, `breaking`), and hide the noise.
3. It proposes the next semver bump from PR labels (`breaking` → major, `feat` → minor, `fix`/`chore` → patch, highest wins). The human can override.
4. "Release" tags the repo, creates a GitHub release with the notes, and publishes them to a **public page** and an **embeddable widget**.
5. Public page has an RSS feed.

## Done looks like

- A user can go from "connect repo" to a published public changelog page in under ten minutes.
- Version inference matches release-please on a fixed set of 20 sample PRs.
- Public page passes automated a11y checks and loads in under 1s on a slow 3G profile.
- The tool publishes its own changelog from its own repo (dogfooding).

## Out of scope (v1)

- Auth beyond a single GitHub login.
- Multiple repos per project.
- Email/notification sending.
- Any AI rewriting of entries (later, maybe).

## Open questions (for the planner loop to ask)

- Hosted (needs a backend + DB) or static (GitHub Action writes JSON, page reads it)?
- Widget: iframe or web component?
