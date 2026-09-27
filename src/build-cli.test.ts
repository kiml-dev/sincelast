import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

let dir: string;
let output: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "sincelast-build-cli-"));
  output = join(dir, "index.html");
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

function runCli(input: string) {
  return spawnSync(process.execPath, ["src/build-cli.ts", input, output], { encoding: "utf8" });
}

describe("build-cli", () => {
  it("exits 0 and writes the page for valid data", async () => {
    const result = runCli("test/fixtures/valid.json");
    expect(result.status, result.stderr).toBe(0);
    const html = await readFile(output, "utf8");
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("Add dark mode");
  });

  it("exits non-zero and leaves output alone for invalid data", async () => {
    const input = "test/fixtures/invalid-tag.json";
    await writeFile(output, "original", "utf8");
    const result = runCli(input);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(input);
    expect(result.stderr).toContain("entries[0].tag");
    expect(await readFile(output, "utf8")).toBe("original");
  });
});
