import { readFileSync } from "node:fs";
import { checkBudgets, formatResult } from "./perf.ts";

const path = process.argv[2] ?? "public/index.html";
const results = checkBudgets(readFileSync(path, "utf8"));

console.log(`Page-weight budget for ${path}`);
for (const r of results) console.log(formatResult(r));

if (results.some((r) => !r.pass)) process.exitCode = 1;
