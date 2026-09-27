import type { Entry, Release, Tag } from "./entries";

const TAG_ORDER: Record<Exclude<Tag, "chore">, number> = { breaking: 0, feat: 1, fix: 2 };

function parseVersion(version: string): { core: number[]; pre: string[] } {
  // Build metadata ("+...") has no bearing on precedence.
  const [withoutBuild = ""] = version.split("+");
  const dash = withoutBuild.indexOf("-");
  const core = dash === -1 ? withoutBuild : withoutBuild.slice(0, dash);
  const pre = dash === -1 ? [] : withoutBuild.slice(dash + 1).split(".");
  return { core: core.split(".").map(Number), pre };
}

function compareIdentifiers(a: string, b: string): number {
  const aNum = /^\d+$/.test(a);
  const bNum = /^\d+$/.test(b);
  if (aNum && bNum) return Number(a) - Number(b);
  if (aNum) return -1;
  if (bNum) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

// Semver 2.0.0 precedence: negative when a < b.
export function compareVersions(a: string, b: string): number {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  for (let i = 0; i < 3; i++) {
    const diff = (va.core[i] ?? 0) - (vb.core[i] ?? 0);
    if (diff !== 0) return diff;
  }
  if (va.pre.length === 0 || vb.pre.length === 0) {
    return vb.pre.length - va.pre.length;
  }
  for (let i = 0; i < Math.min(va.pre.length, vb.pre.length); i++) {
    const diff = compareIdentifiers(va.pre[i] ?? "", vb.pre[i] ?? "");
    if (diff !== 0) return diff;
  }
  return va.pre.length - vb.pre.length;
}

export function selectReleases(entries: Entry[]): Release[] {
  const byVersion = new Map<string, Release>();
  for (const entry of entries) {
    if (entry.version === null || entry.releasedAt === null) continue;
    if (entry.hidden || entry.tag === "chore") continue;
    let release = byVersion.get(entry.version);
    if (release === undefined) {
      release = { version: entry.version, releasedAt: entry.releasedAt, entries: [] };
      byVersion.set(entry.version, release);
    }
    release.entries.push(entry);
  }

  const releases = [...byVersion.values()];
  for (const release of releases) {
    // Array.prototype.sort is stable, so file order holds within a tag.
    release.entries.sort(
      (a, b) =>
        TAG_ORDER[a.tag as Exclude<Tag, "chore">] - TAG_ORDER[b.tag as Exclude<Tag, "chore">],
    );
  }
  return releases.sort((a, b) => compareVersions(b.version, a.version));
}
