export type Tag = "feat" | "fix" | "breaking" | "chore";

export type Entry = {
  id: string;
  title: string;
  body: string;
  tag: Tag;
  hidden: boolean;
  version: string | null;
  releasedAt: string | null;
  prNumber: number | null;
  prUrl: string | null;
};

export type Release = {
  version: string;
  releasedAt: string;
  entries: Entry[];
};

const TAGS: readonly Tag[] = ["feat", "fix", "breaking", "chore"];

const FIELDS = [
  "id",
  "title",
  "body",
  "tag",
  "hidden",
  "version",
  "releasedAt",
  "prNumber",
  "prUrl",
] as const;

// Official semver 2.0.0 grammar, without a leading "v".
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function fail(path: string, message: string): never {
  throw new Error(`${path}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  // Reject dates like 2026-02-30 that the regex lets through.
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

function isHttpsUrl(value: string): boolean {
  if (!value.startsWith("https://")) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function nonEmptyString(obj: Record<string, unknown>, key: string, path: string): string {
  const value = obj[key];
  if (typeof value !== "string" || value.length === 0) {
    fail(`${path}.${key}`, "expected non-empty string");
  }
  return value;
}

function nullable<T>(
  obj: Record<string, unknown>,
  key: string,
  path: string,
  check: (value: unknown) => value is T,
  expected: string,
): T | null {
  const value = obj[key];
  if (value === null) return null;
  if (!check(value)) fail(`${path}.${key}`, `expected ${expected} or null`);
  return value;
}

function parseEntry(raw: unknown, path: string): Entry {
  if (!isRecord(raw)) fail(path, "expected object");

  for (const key of FIELDS) {
    if (!(key in raw)) fail(`${path}.${key}`, "missing field");
  }
  for (const key of Object.keys(raw)) {
    if (!(FIELDS as readonly string[]).includes(key)) fail(`${path}.${key}`, "unknown field");
  }

  const id = nonEmptyString(raw, "id", path);
  const title = nonEmptyString(raw, "title", path);

  if (typeof raw.body !== "string") fail(`${path}.body`, "expected string");
  const body = raw.body;

  if (!TAGS.includes(raw.tag as Tag)) fail(`${path}.tag`, `expected one of ${TAGS.join(", ")}`);
  const tag = raw.tag as Tag;

  if (typeof raw.hidden !== "boolean") fail(`${path}.hidden`, "expected boolean");
  const hidden = raw.hidden;

  const version = nullable(
    raw,
    "version",
    path,
    (v): v is string => typeof v === "string" && SEMVER.test(v),
    "semver string like 1.2.0",
  );
  const releasedAt = nullable(
    raw,
    "releasedAt",
    path,
    (v): v is string => typeof v === "string" && isIsoDate(v),
    "date YYYY-MM-DD",
  );
  const prNumber = nullable(
    raw,
    "prNumber",
    path,
    (v): v is number => Number.isInteger(v) && (v as number) > 0,
    "positive integer",
  );
  const prUrl = nullable(
    raw,
    "prUrl",
    path,
    (v): v is string => typeof v === "string" && isHttpsUrl(v),
    "https:// URL",
  );

  if (version !== null && releasedAt === null) {
    fail(`${path}.releasedAt`, "required when version is set");
  }
  if (version === null && releasedAt !== null) {
    fail(`${path}.version`, "required when releasedAt is set");
  }

  return { id, title, body, tag, hidden, version, releasedAt, prNumber, prUrl };
}

export function parseEntries(data: unknown): Entry[] {
  if (!Array.isArray(data)) fail("entries", "expected array");

  const entries = data.map((raw, i) => parseEntry(raw, `entries[${i}]`));

  const seenIds = new Map<string, number>();
  const releaseDates = new Map<string, string>();
  entries.forEach((entry, i) => {
    const path = `entries[${i}]`;

    const firstId = seenIds.get(entry.id);
    if (firstId !== undefined) {
      fail(`${path}.id`, `duplicate id "${entry.id}" (also entries[${firstId}])`);
    }
    seenIds.set(entry.id, i);

    if (entry.version !== null && entry.releasedAt !== null) {
      const date = releaseDates.get(entry.version);
      if (date !== undefined && date !== entry.releasedAt) {
        fail(
          `${path}.releasedAt`,
          `version ${entry.version} already released on ${date}, got ${entry.releasedAt}`,
        );
      }
      releaseDates.set(entry.version, entry.releasedAt);
    }
  });

  return entries;
}
