import { buildPage } from "./build.ts";

const input = process.argv[2] ?? "data/entries.json";
const output = process.argv[3] ?? "public/index.html";

try {
  await buildPage({ input, output });
  console.log(`Wrote ${output} from ${input}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
