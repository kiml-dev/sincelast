import { describe, expect, it } from "vitest";
import { parseEntries, type Entry } from "./entries";

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

describe("parseEntries", () => {
  it("accepts a valid list", () => {
    const data = [
      entry(),
      entry({ id: "e2", tag: "fix", version: "1.0.0", releasedAt: "2026-09-01" }),
      entry({ id: "e3", tag: "chore", hidden: true, version: "1.1.0-beta.1", releasedAt: "2026-09-10" }),
      entry({ id: "e4", tag: "breaking", version: null, releasedAt: null, prNumber: null, prUrl: null }),
    ];
    expect(parseEntries(structuredClone(data))).toEqual(data);
  });

  it("accepts an empty list", () => {
    expect(parseEntries([])).toEqual([]);
  });

  it("rejects a non-array", () => {
    expect(() => parseEntries({ entries: [] })).toThrow(/^entries: expected array/);
    expect(() => parseEntries(null)).toThrow(Error);
  });

  it("names the path of a bad tag", () => {
    const data = [entry({ id: "a" }), entry({ id: "b" }), { ...entry({ id: "c" }), tag: "feature" }];
    expect(() => parseEntries(data)).toThrow(
      "entries[2].tag: expected one of feat, fix, breaking, chore",
    );
  });

  it("rejects missing fields", () => {
    for (const key of Object.keys(entry()) as (keyof Entry)[]) {
      const bad: Record<string, unknown> = entry();
      delete bad[key];
      expect(() => parseEntries([bad]), key).toThrow(`entries[0].${key}`);
    }
  });

  it("rejects wrongly typed fields", () => {
    const cases: [keyof Entry, unknown][] = [
      ["id", ""],
      ["id", 1],
      ["title", ""],
      ["body", null],
      ["hidden", "false"],
      ["releasedAt", "2026/09/01"],
      ["releasedAt", "2026-02-30"],
      ["prNumber", 0],
      ["prNumber", 1.5],
      ["prUrl", "http://example.com"],
    ];
    for (const [key, value] of cases) {
      expect(() => parseEntries([{ ...entry(), [key]: value }]), `${key}=${String(value)}`).toThrow(
        `entries[0].${key}`,
      );
    }
  });

  it("rejects unknown fields", () => {
    expect(() => parseEntries([{ ...entry(), labels: ["feat"] }])).toThrow(
      "entries[0].labels: unknown field",
    );
  });

  it("rejects non-semver version", () => {
    for (const version of ["v1", "1.2", "v1.2.0"]) {
      expect(() => parseEntries([entry({ version })]), version).toThrow("entries[0].version");
    }
  });

  it("rejects version without releasedAt", () => {
    expect(() => parseEntries([entry({ version: "1.0.0", releasedAt: null })])).toThrow(
      "entries[0].releasedAt",
    );
    expect(() => parseEntries([entry({ version: null, releasedAt: "2026-09-01" })])).toThrow(
      "entries[0].version",
    );
  });

  it("rejects duplicate ids", () => {
    expect(() => parseEntries([entry({ id: "x" }), entry({ id: "x" })])).toThrow(
      /entries\[1\]\.id: duplicate id "x"/,
    );
  });

  it("rejects inconsistent release dates", () => {
    const data = [
      entry({ id: "a", version: "1.0.0", releasedAt: "2026-09-01" }),
      entry({ id: "b", version: "1.0.0", releasedAt: "2026-09-02" }),
    ];
    expect(() => parseEntries(data)).toThrow("entries[1].releasedAt");
  });
});
