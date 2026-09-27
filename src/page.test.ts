import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Entry, Release } from "./entries";
import { renderPage } from "./page";
import { GZIP_BUDGET, gzipSize } from "./perf";

const LOGO = readFileSync(new URL("../public/logo.svg", import.meta.url), "utf8");

function entry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: "e1",
    title: "Add dark mode",
    body: "You can now switch to **dark mode**.",
    tag: "feat",
    hidden: false,
    version: "1.0.0",
    releasedAt: "2026-09-01",
    prNumber: 12,
    prUrl: "https://github.com/kiml-dev/sincelast/pull/12",
    ...overrides,
  };
}

function release(overrides: Partial<Release> = {}): Release {
  return { version: "1.0.0", releasedAt: "2026-09-01", entries: [entry()], ...overrides };
}

function render(releases: Release[]): string {
  return renderPage(releases, { logoSvg: LOGO });
}

function count(html: string, pattern: RegExp): number {
  return html.match(new RegExp(pattern.source, "g"))?.length ?? 0;
}

describe("renderPage", () => {
  it("renders document shell", () => {
    const html = render([release()]);
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<meta charset="utf-8" />');
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1" />');
    expect(html).toContain("<title>sincelast — what's new</title>");
    expect(count(html, /<main[\s>]/)).toBe(1);
    expect(count(html, /<h1[\s>]/)).toBe(1);
    expect(html).toContain("<h1>What's new</h1>");
  });

  it("renders releases in given order", () => {
    const html = render([
      release({ version: "2.0.0", releasedAt: "2026-09-10" }),
      release({ version: "1.0.0", releasedAt: "2026-09-01" }),
    ]);
    expect(count(html, /<section[\s>]/)).toBe(2);
    const second = html.indexOf("<h2>2.0.0</h2>");
    const first = html.indexOf("<h2>1.0.0</h2>");
    expect(second).toBeGreaterThan(-1);
    expect(first).toBeGreaterThan(second);
    expect(html).toContain('<time datetime="2026-09-10">2026-09-10</time>');
    expect(html).toContain('<time datetime="2026-09-01">2026-09-01</time>');
  });

  it("renders tag labels", () => {
    const html = render([
      release({
        entries: [
          entry({ id: "a", tag: "breaking" }),
          entry({ id: "b", tag: "feat" }),
          entry({ id: "c", tag: "fix" }),
        ],
      }),
    ]);
    expect(html).toContain(">Breaking<");
    expect(html).toContain(">Feature<");
    expect(html).toContain(">Fix<");
  });

  it("renders markdown body", () => {
    const html = render([release({ entries: [entry({ body: "**x**" })] })]);
    expect(html).toContain("<strong>x</strong>");
  });

  it("renders titles as h3 inside a list", () => {
    const html = render([release()]);
    expect(html).toMatch(/<ul><li>.*<h3>Add dark mode<\/h3>.*<\/li><\/ul>/s);
  });

  it("links PRs when present", () => {
    const linked = render([release()]);
    expect(linked).toContain('<a href="https://github.com/kiml-dev/sincelast/pull/12">#12</a>');

    const unlinked = render([release({ entries: [entry({ prNumber: null, prUrl: null })] })]);
    expect(unlinked).not.toContain("<a ");
  });

  it("escapes titles", () => {
    const html = render([
      release({
        entries: [entry({ title: "<b>x</b>", prUrl: 'https://example.com/"><script>' })],
      }),
    ]);
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(html).not.toContain("<b>x</b>");
    expect(html).toContain('href="https://example.com/&quot;&gt;&lt;script&gt;"');
  });

  it("shows empty state", () => {
    const html = render([]);
    expect(html).toContain("No releases yet.");
    expect(html).not.toContain("<section");
  });

  it("inlines the logo", () => {
    const html = render([]);
    expect(html).toMatch(/<svg role="img" aria-label="sincelast logo"/);
    expect(html).toContain('<circle cx="32" cy="32" r="26"');
    expect(html).not.toContain("<img");
  });

  it("ships no script or web fonts", () => {
    const html = render([release()]);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toContain("@font-face");
    expect(html).not.toMatch(/<link[^>]*rel="stylesheet"/i);
    expect(count(html, /<style[\s>]/)).toBe(1);
  });

  it("stays under size budget", () => {
    const tags = ["feat", "fix", "breaking"] as const;
    let n = 0;
    const releases = [3, 4, 3].map((size, r) =>
      release({
        version: `1.${2 - r}.0`,
        releasedAt: `2026-09-0${3 - r}`,
        entries: Array.from({ length: size }, () => {
          n++;
          return entry({
            id: `e${n}`,
            tag: tags[n % 3],
            title: `Entry number ${n} with a reasonably descriptive title`,
            body: `This change does something useful.\n\n- first point about **entry ${n}**\n- second point with [a link](https://example.com/${n})`,
            prNumber: 100 + n,
            prUrl: `https://github.com/kiml-dev/sincelast/pull/${100 + n}`,
          });
        }),
      }),
    );
    expect(releases.flatMap((r) => r.entries)).toHaveLength(10);
    expect(gzipSize(render(releases))).toBeLessThanOrEqual(GZIP_BUDGET);
  });
});
