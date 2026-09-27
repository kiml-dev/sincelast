import { describe, expect, it } from "vitest";
import type { Entry } from "./entries";
import { loadEntries } from "./load";

const SAMPLE = "data/entries.json";

describe("loadEntries", () => {
  it("sample data file is valid", async () => {
    await expect(loadEntries(SAMPLE)).resolves.toBeInstanceOf(Array);
  });

  it("sample data covers every case", async () => {
    const entries = await loadEntries(SAMPLE);
    const released = entries.filter((e) => e.version !== null);
    const versions = new Set(released.map((e) => e.version));
    expect(versions.size).toBeGreaterThanOrEqual(3);

    const breakingVersions = released.filter((e) => e.tag === "breaking").map((e) => e.version);
    expect(breakingVersions.length).toBeGreaterThanOrEqual(1);

    for (const tag of ["feat", "fix", "breaking", "chore"] as const) {
      expect(entries.some((e) => e.tag === tag), `tag ${tag}`).toBe(true);
    }
    expect(entries.some((e) => e.hidden)).toBe(true);
    expect(entries.filter((e) => e.version === null).length).toBeGreaterThanOrEqual(2);
    expect(entries.some((e) => e.prNumber === null && e.prUrl === null)).toBe(true);

    const rich = entries.filter(
      (e) =>
        /\[[^\]]+\]\(https?:\/\/[^)]+\)/.test(e.body) &&
        /^\s*[-*] /m.test(e.body) &&
        /`[^`]+`/.test(e.body),
    );
    expect(rich.length).toBeGreaterThanOrEqual(1);
  });

  it("sample titles are marked", async () => {
    const entries = await loadEntries(SAMPLE);
    for (const e of entries) expect(e.title).toMatch(/^Sample:/);
  });

  it("sample PR links are not real", async () => {
    const entries = await loadEntries(SAMPLE);
    for (const e of entries) {
      if (e.prUrl === null) continue;
      expect(e.prUrl).toBe(`https://github.com/example/example/pull/${e.prNumber}`);
    }
  });

  it("loads a valid fixture", async () => {
    const expected: Entry[] = [
      {
        id: "a",
        title: "Add dark mode",
        body: "You can now switch to **dark mode**.",
        tag: "feat",
        hidden: false,
        version: "1.0.0",
        releasedAt: "2026-09-01",
        prNumber: 12,
        prUrl: "https://github.com/example/example/pull/12",
      },
      {
        id: "b",
        title: "Fix broken link",
        body: "",
        tag: "fix",
        hidden: false,
        version: null,
        releasedAt: null,
        prNumber: null,
        prUrl: null,
      },
    ];
    await expect(loadEntries("test/fixtures/valid.json")).resolves.toEqual(expected);
  });

  it("reports path on schema error", async () => {
    const path = "test/fixtures/invalid-tag.json";
    const error = await loadEntries(path).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(path);
    expect((error as Error).message).toContain("entries[0].tag");
  });

  it("reports path on malformed JSON", async () => {
    const path = "test/fixtures/malformed.json";
    const error = await loadEntries(path).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(path);
    expect((error as Error).message).toContain("invalid JSON");
  });

  it("reports missing file", async () => {
    const path = "test/fixtures/does-not-exist.json";
    const error = await loadEntries(path).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(path);
  });
});
