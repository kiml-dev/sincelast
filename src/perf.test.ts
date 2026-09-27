import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { checkBudgets, countRequests, formatResult, GZIP_BUDGET, gzipSize } from "./perf";

function page(body: string, head = ""): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    `<head><meta charset="utf-8" /><title>t</title>${head}</head>`,
    `<body><main><h1>t</h1>${body}</main></body>`,
    "</html>",
  ].join("\n");
}

function budget(html: string, name: string) {
  const result = checkBudgets(html).find((r) => r.name === name);
  if (!result) throw new Error(`no budget named ${name}`);
  return result;
}

// Deterministic, poorly compressible filler: chained SHA-256 hex digests.
function noise(length: number): string {
  let out = "";
  let digest = "seed";
  while (out.length < length) {
    digest = createHash("sha256").update(digest).digest("hex");
    out += digest;
  }
  return out.slice(0, length);
}

describe("perf budgets", () => {
  it("passes a small page", () => {
    const results = checkBudgets(page("<p>No releases yet.</p>"));
    expect(results).toHaveLength(3);
    for (const r of results) expect(r.pass).toBe(true);
  });

  it("fails over the gzip budget", () => {
    const html = page(`<p>${noise(60000)}</p>`);
    const size = gzipSize(html);
    expect(size).toBeGreaterThan(GZIP_BUDGET);
    const result = budget(html, "gzip size");
    expect(result.pass).toBe(false);
    const message = formatResult(result);
    expect(message).toContain(String(size));
    expect(message).toContain(String(GZIP_BUDGET));
  });

  it("counts subresource requests", () => {
    const html = page('<img src="logo.svg" alt="" />', '<link rel="icon" href="favicon.ico" />');
    expect(countRequests(html)).toBe(3);
    expect(budget(html, "requests").pass).toBe(false);
  });

  it("counts inline style urls", () => {
    const html = page(
      '<div style="background: url(\'a.png\')"></div>',
      "<style>body { background: url(b.png); }</style>",
    );
    expect(countRequests(html)).toBe(3);
  });

  it("ignores data urls and fragments", () => {
    const html = page(
      [
        '<img src="data:image/png;base64,AAAA" alt="" />',
        '<a href="#x">x</a>',
        '<link rel="preload" href="#x" />',
        '<div style="background: url(data:image/gif;base64,R0lG)"></div>',
      ].join(""),
    );
    expect(countRequests(html)).toBe(1);
    expect(budget(html, "requests").pass).toBe(true);
  });

  it("flags render-blocking resources", () => {
    const stylesheet = page("", '<link rel="stylesheet" href="app.css" />');
    expect(budget(stylesheet, "render-blocking resources").pass).toBe(false);

    const script = page('<script src="app.js"></script>');
    expect(budget(script, "render-blocking resources").pass).toBe(false);

    const deferred = page('<script src="app.js" defer></script>');
    expect(budget(deferred, "render-blocking resources").pass).toBe(true);
    expect(countRequests(deferred)).toBe(2);

    const asynced = page('<script async src="app.js"></script>');
    expect(budget(asynced, "render-blocking resources").pass).toBe(true);
  });

  it("is deterministic", () => {
    const html = page('<img src="logo.svg" alt="" /><p>hello</p>');
    expect(checkBudgets(html)).toEqual(checkBudgets(html));
  });
});
