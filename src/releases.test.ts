import { describe, expect, it } from "vitest";
import type { Entry } from "./entries";
import { compareVersions, selectReleases } from "./releases";

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

function ids(entries: Entry[]): string[] {
  return entries.map((e) => e.id);
}

describe("selectReleases", () => {
  it("drops unreleased entries", () => {
    const releases = selectReleases([
      entry({ id: "a" }),
      entry({ id: "b", version: null, releasedAt: null }),
    ]);
    expect(releases).toHaveLength(1);
    expect(ids(releases[0]!.entries)).toEqual(["a"]);
  });

  it("drops hidden entries", () => {
    const releases = selectReleases([entry({ id: "a" }), entry({ id: "b", hidden: true })]);
    expect(ids(releases[0]!.entries)).toEqual(["a"]);
  });

  it("drops chore entries", () => {
    const releases = selectReleases([entry({ id: "a" }), entry({ id: "b", tag: "chore" })]);
    expect(ids(releases[0]!.entries)).toEqual(["a"]);
  });

  it("groups by version", () => {
    const releases = selectReleases([
      entry({ id: "a", version: "1.0.0", releasedAt: "2026-09-01" }),
      entry({ id: "b", version: "1.1.0", releasedAt: "2026-09-10" }),
      entry({ id: "c", version: "1.0.0", releasedAt: "2026-09-01" }),
    ]);
    expect(releases).toEqual([
      { version: "1.1.0", releasedAt: "2026-09-10", entries: [expect.objectContaining({ id: "b" })] },
      {
        version: "1.0.0",
        releasedAt: "2026-09-01",
        entries: [expect.objectContaining({ id: "a" }), expect.objectContaining({ id: "c" })],
      },
    ]);
  });

  it("orders releases by semver", () => {
    const releases = selectReleases(
      ["1.9.0", "1.10.0", "2.0.0-beta.1", "2.0.0"].map((version) =>
        entry({ id: version, version }),
      ),
    );
    expect(releases.map((r) => r.version)).toEqual(["2.0.0", "2.0.0-beta.1", "1.10.0", "1.9.0"]);
  });

  it("orders entries by tag", () => {
    const releases = selectReleases([
      entry({ id: "fix1", tag: "fix" }),
      entry({ id: "feat1", tag: "feat" }),
      entry({ id: "brk1", tag: "breaking" }),
      entry({ id: "fix2", tag: "fix" }),
      entry({ id: "feat2", tag: "feat" }),
      entry({ id: "brk2", tag: "breaking" }),
    ]);
    expect(ids(releases[0]!.entries)).toEqual(["brk1", "brk2", "feat1", "feat2", "fix1", "fix2"]);
  });

  it("drops releases with nothing visible", () => {
    const releases = selectReleases([
      entry({ id: "a", version: "1.0.0" }),
      entry({ id: "b", version: "1.1.0", hidden: true }),
      entry({ id: "c", version: "1.1.0", tag: "chore" }),
    ]);
    expect(releases.map((r) => r.version)).toEqual(["1.0.0"]);
  });

  it("returns empty for nothing visible", () => {
    expect(selectReleases([])).toEqual([]);
    expect(
      selectReleases([
        entry({ id: "a", hidden: true }),
        entry({ id: "b", tag: "chore" }),
        entry({ id: "c", version: null, releasedAt: null }),
      ]),
    ).toEqual([]);
  });

  it("does not mutate input", () => {
    const input = [
      entry({ id: "a", tag: "fix", version: "1.0.0" }),
      entry({ id: "b", tag: "breaking", version: "1.0.0" }),
      entry({ id: "c", version: "2.0.0", hidden: true }),
    ];
    const before = structuredClone(input);
    selectReleases(input);
    expect(input).toEqual(before);
  });
});

describe("compareVersions", () => {
  it("follows semver precedence", () => {
    const ordered = [
      "1.0.0-alpha",
      "1.0.0-alpha.1",
      "1.0.0-alpha.beta",
      "1.0.0-beta",
      "1.0.0-beta.2",
      "1.0.0-beta.11",
      "1.0.0-rc.1",
      "1.0.0",
      "1.9.0",
      "1.10.0",
    ];
    for (let i = 0; i < ordered.length - 1; i++) {
      expect(compareVersions(ordered[i]!, ordered[i + 1]!)).toBeLessThan(0);
      expect(compareVersions(ordered[i + 1]!, ordered[i]!)).toBeGreaterThan(0);
    }
    expect(compareVersions("1.0.0+build.1", "1.0.0")).toBe(0);
  });
});
