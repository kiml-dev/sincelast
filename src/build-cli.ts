import { buildPage } from "./build.ts";

const input = "data/entries.json";
const output = "public/index.html";

try {
  await buildPage({ input, output });
  console.log(`Wrote ${output} from ${input}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
