import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildPage } from "./build";
import { loadEntries } from "./load";

let dir: string;
let output: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "sincelast-build-"));
  output = join(dir, "index.html");
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("buildPage", () => {
  it("writes the page from a data file", async () => {
    await buildPage({ input: "test/fixtures/valid.json", output });
    const html = await readFile(output, "utf8");
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<h2>1.0.0</h2>");
    expect(html).toContain("Add dark mode");
    expect(await readdir(dir)).toEqual(["index.html"]);
  });

  it("excludes hidden, chore and unreleased entries", async () => {
    await buildPage({ input: "test/fixtures/mixed.json", output });
    const html = await readFile(output, "utf8");
    expect(html).toContain("Add dark mode");
    expect(html).not.toContain("Hidden internal fix");
    expect(html).not.toContain("Chore dependency bump");
    expect(html).not.toContain("Unreleased feature");
  });

  it("shows only visible sample releases", async () => {
    await buildPage({ input: "data/entries.json", output });
    const html = await readFile(output, "utf8");
    const entries = await loadEntries("data/entries.json");
    for (const e of entries) {
      const visible = e.version !== null && e.releasedAt !== null && !e.hidden && e.tag !== "chore";
      if (visible) expect(html).toContain(`<h2>${e.version}</h2>`);
      expect(html.includes(e.title), e.id).toBe(visible);
    }
  });

  it("leaves output untouched on invalid data", async () => {
    const input = "test/fixtures/invalid-tag.json";
    await writeFile(output, "original", "utf8");
    const error = await buildPage({ input, output }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(input);
    expect((error as Error).message).toContain("entries[0].tag");
    expect(await readFile(output, "utf8")).toBe("original");
    expect(await readdir(dir)).toEqual(["index.html"]);
  });

  it("writes empty state for no releases", async () => {
    await buildPage({ input: "test/fixtures/unreleased-only.json", output });
    const html = await readFile(output, "utf8");
    expect(html).toContain("<p>No releases yet.</p>");
    expect(html).not.toContain("Unreleased feature");
  });
});
