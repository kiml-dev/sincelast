import { gzipSync } from "node:zlib";

// 14 KB fits in the first TCP round trip.
export const GZIP_BUDGET = 14 * 1024;
// The document itself plus at most one subresource.
export const REQUEST_BUDGET = 2;

export type BudgetResult = {
  name: string;
  measured: string;
  budget: string;
  pass: boolean;
};

type Tag = { name: string; attrs: Map<string, string> };

const TAG = /<([a-zA-Z][\w-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ATTR = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
const STYLE_BLOCK = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
const CSS_URL = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi;

function stripComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

function parseTags(html: string): Tag[] {
  const tags: Tag[] = [];
  for (const [, name, rest] of stripComments(html).matchAll(TAG)) {
    const attrs = new Map<string, string>();
    for (const [, key, dq, sq, bare] of rest.matchAll(ATTR)) {
      const k = key.toLowerCase();
      if (!attrs.has(k)) attrs.set(k, dq ?? sq ?? bare ?? "");
    }
    tags.push({ name: name.toLowerCase(), attrs });
  }
  return tags;
}

function relTokens(tag: Tag): string[] {
  return (tag.attrs.get("rel") ?? "").toLowerCase().split(/\s+/).filter(Boolean);
}

// `data:` URLs and same-document fragments never hit the network.
export function isRequest(url: string): boolean {
  const u = url.trim();
  return u !== "" && !u.startsWith("#") && !/^data:/i.test(u);
}

const SRC_TAGS = new Set(["img", "script", "iframe", "video", "audio", "source"]);
const LINK_RELS = new Set(["stylesheet", "icon", "preload"]);

function cssUrls(css: string): string[] {
  return [...css.matchAll(CSS_URL)].map(([, dq, sq, bare]) => dq ?? sq ?? bare ?? "");
}

// Subresource URLs the page would fetch, excluding the document itself.
export function subresources(html: string): string[] {
  const urls: string[] = [];
  for (const tag of parseTags(html)) {
    const src = tag.attrs.get("src");
    if (SRC_TAGS.has(tag.name) && src !== undefined) urls.push(src);
    const href = tag.attrs.get("href");
    if (tag.name === "link" && href !== undefined && relTokens(tag).some((r) => LINK_RELS.has(r))) {
      urls.push(href);
    }
    const style = tag.attrs.get("style");
    if (style !== undefined) urls.push(...cssUrls(style));
  }
  for (const [, css] of stripComments(html).matchAll(STYLE_BLOCK)) urls.push(...cssUrls(css));
  return urls.filter(isRequest);
}

export function countRequests(html: string): number {
  return 1 + subresources(html).length;
}

export function gzipSize(html: string): number {
  return gzipSync(Buffer.from(html, "utf8")).length;
}

export function renderBlocking(html: string): string[] {
  const blocking: string[] = [];
  for (const tag of parseTags(html)) {
    const href = tag.attrs.get("href");
    if (tag.name === "link" && href !== undefined && relTokens(tag).includes("stylesheet")) {
      blocking.push(`stylesheet ${href}`);
    }
    const src = tag.attrs.get("src");
    if (tag.name === "script" && src !== undefined && !tag.attrs.has("async") && !tag.attrs.has("defer")) {
      blocking.push(`script ${src}`);
    }
  }
  return blocking;
}

export function checkBudgets(html: string): BudgetResult[] {
  const size = gzipSize(html);
  const requests = countRequests(html);
  const blocking = renderBlocking(html);
  return [
    {
      name: "gzip size",
      measured: `${size} B`,
      budget: `${GZIP_BUDGET} B`,
      pass: size <= GZIP_BUDGET,
    },
    {
      name: "requests",
      measured: `${requests}`,
      budget: `${REQUEST_BUDGET}`,
      pass: requests <= REQUEST_BUDGET,
    },
    {
      name: "render-blocking resources",
      measured: blocking.length === 0 ? "0" : `${blocking.length} (${blocking.join(", ")})`,
      budget: "0",
      pass: blocking.length === 0,
    },
  ];
}

export function formatResult(r: BudgetResult): string {
  return `${r.pass ? "PASS" : "FAIL"}  ${r.name}: ${r.measured} (budget ${r.budget})`;
}
