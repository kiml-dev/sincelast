import { readFile } from "node:fs/promises";
import { parseEntries, type Entry } from "./entries.ts";

function reason(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function loadEntries(path: string): Promise<Entry[]> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    throw new Error(`${path}: cannot read file: ${reason(error)}`, { cause: error });
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(`${path}: invalid JSON: ${reason(error)}`, { cause: error });
  }

  try {
    return parseEntries(data);
  } catch (error) {
    throw new Error(`${path}: ${reason(error)}`, { cause: error });
  }
}
