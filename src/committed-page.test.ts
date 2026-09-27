import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildPage } from "./build";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "sincelast-committed-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("committed page", () => {
  it("committed public/index.html is up to date", async () => {
    const output = join(dir, "index.html");
    await buildPage({ input: "data/entries.json", output });
    const expected = await readFile(output, "utf8");
    const committed = await readFile("public/index.html", "utf8");
    expect(committed === expected, "public/index.html is stale: run `npm run build` and commit the result").toBe(true);
  });
});
