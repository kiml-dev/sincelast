import type { Entry, Release, Tag } from "./entries.ts";
import { renderMarkdown } from "./markdown.ts";

const TAG_LABELS: Record<Tag, string> = {
  feat: "Feature",
  fix: "Fix",
  breaking: "Breaking",
  chore: "Chore",
};

const STYLE = `
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.5; color: #24292f; background: #fff; }
main { max-width: 42rem; margin: 0 auto; padding: 1rem; }
section { border-top: 1px solid #d0d7de; margin-top: 2rem; }
section > ul { list-style: none; padding: 0; }
section > ul > li { margin: 1.5rem 0; }
h3 { margin: 0.25rem 0; }
.tag { display: inline-block; font-size: 0.875rem; font-weight: 600; padding: 0 0.5rem; border: 1px solid currentColor; border-radius: 1rem; }
a { color: #0550ae; }
`.trim();

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// The logo is inlined so it costs no extra request (see the #26 budget).
function logo(svg: string): string {
  return svg.trim().replace(/^<svg\b/, '<svg role="img" aria-label="sincelast logo"');
}

function renderEntry(entry: Entry): string {
  const parts = [
    `<span class="tag">${escapeHtml(TAG_LABELS[entry.tag])}</span>`,
    `<h3>${escapeHtml(entry.title)}</h3>`,
    renderMarkdown(entry.body),
  ];
  if (entry.prUrl !== null) {
    const text = entry.prNumber !== null ? `#${entry.prNumber}` : "Pull request";
    parts.push(`<p><a href="${escapeHtml(entry.prUrl)}">${escapeHtml(text)}</a></p>`);
  }
  return `<li>${parts.join("")}</li>`;
}

function renderRelease(release: Release): string {
  const date = escapeHtml(release.releasedAt);
  return [
    "<section>",
    `<h2>${escapeHtml(release.version)}</h2>`,
    `<p><time datetime="${date}">${date}</time></p>`,
    `<ul>${release.entries.map(renderEntry).join("")}</ul>`,
    "</section>",
  ].join("\n");
}

export function renderPage(releases: Release[], options: { logoSvg: string }): string {
  const content =
    releases.length === 0 ? "<p>No releases yet.</p>" : releases.map(renderRelease).join("\n");
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    "<title>sincelast — what's new</title>",
    `<style>${STYLE}</style>`,
    "</head>",
    "<body>",
    "<main>",
    "<h1>What's new</h1>",
    logo(options.logoSvg),
    content,
    "</main>",
    "</body>",
    "</html>",
    "",
  ].join("\n");
}
