import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";

const marked = new Marked({ async: false, gfm: true });

// The page uses h1–h3 for its own structure, so body headings start at h4.
function demote(level: number): string {
  return `h${Math.min(level + 3, 6)}`;
}

const headingTransforms = Object.fromEntries(
  [1, 2, 3, 4, 5, 6].map((level) => [
    `h${level}`,
    (_tagName: string, attribs: sanitizeHtml.Attributes) => ({
      tagName: demote(level),
      attribs,
    }),
  ]),
);

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "strong", "em", "code", "pre", "blockquote",
    "ul", "ol", "li", "a", "h4", "h5", "h6", "del",
  ],
  allowedAttributes: { a: ["href", "title", "rel"], ol: ["start"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    ...headingTransforms,
    a: (_tagName, attribs) => {
      // Author-supplied rel is dropped; only external links get one.
      const next = { ...attribs };
      delete next.rel;
      if (/^https?:\/\//i.test(next.href ?? "")) next.rel = "noopener noreferrer";
      return { tagName: "a", attribs: next };
    },
  },
};

export function renderMarkdown(source: string): string {
  if (source === "") return "";
  const html = marked.parse(source) as string;
  return sanitizeHtml(html, SANITIZE).trim();
}
