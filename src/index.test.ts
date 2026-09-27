import { describe, expect, it } from "vitest";
import { inferBump } from "./index";

describe("inferBump", () => {
  it("returns major for breaking", () => {
    expect(inferBump(["breaking", "feat"])).toBe("major");
  });

  it("returns minor for feat", () => {
    expect(inferBump(["feat"])).toBe("minor");
  });

  it("returns patch for fix", () => {
    expect(inferBump(["fix"])).toBe("minor");
  });
});
