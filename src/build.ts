import { readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { loadEntries } from "./load.ts";
import { renderPage } from "./page.ts";
import { selectReleases } from "./releases.ts";

const LOGO = new URL("../public/logo.svg", import.meta.url);

export async function buildPage(options: { input: string; output: string }): Promise<void> {
  const entries = await loadEntries(options.input);
  const logoSvg = await readFile(LOGO, "utf8");
  const html = renderPage(selectReleases(entries), { logoSvg });

  // Write next to the output and rename, so a failed build never leaves a half-written page.
  const temp = join(dirname(options.output), `.${basename(options.output)}.${process.pid}.tmp`);
  try {
    await writeFile(temp, html, "utf8");
    await rename(temp, options.output);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
}
