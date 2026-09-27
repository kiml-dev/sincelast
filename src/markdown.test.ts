import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

const DANGEROUS = /<(script|style|iframe|object|embed)\b/i;
const HANDLER = /\son[a-z]+\s*=/i;
const BAD_URL = /(href|src)\s*=\s*["']?\s*(javascript|vbscript|data):/i;

function expectSafe(html: string): void {
  expect(html).not.toMatch(DANGEROUS);
  expect(html).not.toMatch(HANDLER);
  expect(html).not.toMatch(BAD_URL);
}

describe("renderMarkdown", () => {
  it("renders basic formatting", () => {
    const html = renderMarkdown(
      [
        "First paragraph with **bold**, *emphasis* and `code`.",
        "",
        "Second paragraph.",
        "",
        "- one",
        "- two",
        "",
        "1. first",
        "2. second",
        "",
        "```",
        "const x = 1;",
        "```",
      ].join("\n"),
    );
    expect(html.match(/<p>/g)).toHaveLength(2);
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>emphasis</em>");
    expect(html).toContain("<code>code</code>");
    expect(html).toMatch(/<ul>\s*<li>one<\/li>\s*<li>two<\/li>\s*<\/ul>/);
    expect(html).toMatch(/<ol>\s*<li>first<\/li>\s*<li>second<\/li>\s*<\/ol>/);
    expect(html).toMatch(/<pre><code>const x = 1;\s*<\/code><\/pre>/);
  });

  it("renders links with rel", () => {
    const html = renderMarkdown("[x](https://example.com)");
    expect(html).toContain('<a href="https://example.com" rel="noopener noreferrer">x</a>');
  });

  it("does not add rel to same-site links", () => {
    const html = renderMarkdown("[x](#notes)");
    expect(html).toContain('<a href="#notes">x</a>');
  });

  it("strips script tags", () => {
    const html = renderMarkdown("<script>alert(1)</script>\n\nhello");
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toContain("alert(1)");
    expect(html).toContain("hello");
  });

  it("strips event handlers", () => {
    const html = renderMarkdown("<img src=x onerror=alert(1)>");
    expect(html).not.toContain("onerror");
    expectSafe(html);
  });

  it("strips javascript urls", () => {
    const md = renderMarkdown("[x](javascript:alert(1))");
    expect(md).not.toMatch(/javascript:/i);
    const raw = renderMarkdown('<a href="javascript:alert(1)">x</a>');
    expect(raw).not.toMatch(/javascript:/i);
    const obfuscated = renderMarkdown('<a href="jav&#x09;ascript:alert(1)">x</a>');
    expect(obfuscated).not.toMatch(/javascript:/i);
  });

  it("strips vbscript and data urls", () => {
    expectSafe(renderMarkdown("[x](vbscript:msgbox(1))"));
    expectSafe(renderMarkdown("[x](data:text/html,<script>alert(1)</script>)"));
    expectSafe(renderMarkdown('<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>'));
  });

  it("strips dangerous elements", () => {
    const cases = [
      "<style>body{display:none}</style>",
      '<iframe src="https://evil.example"></iframe>',
      '<object data="x.swf"></object>',
      '<embed src="x.swf">',
      "<svg onload=alert(1)>",
      '<div style="background:url(javascript:alert(1))">x</div>',
      "<p onclick=\"alert(1)\">x</p>",
    ];
    for (const input of cases) expectSafe(renderMarkdown(input));
  });

  it("demotes headings", () => {
    expect(renderMarkdown("# Title")).toBe("<h4>Title</h4>");
    expect(renderMarkdown("## Sub")).toBe("<h5>Sub</h5>");
    expect(renderMarkdown("### Deep")).toBe("<h6>Deep</h6>");
    expect(renderMarkdown("<h1>Raw</h1>")).toBe("<h4>Raw</h4>");
  });

  it("handles empty input", () => {
    expect(renderMarkdown("")).toBe("");
  });
});
