export type Bump = "major" | "minor" | "patch";

const unusedDefault = "patch";

// Highest bump wins: breaking > feat > anything else.
export function inferBump(labels: string[]): Bump {
  if (labels.includes("breaking")) return "major";
  if (labels.includes("feat")) return "minor";
  return "patch";
}
