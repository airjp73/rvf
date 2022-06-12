import { describe, expect, it } from "vitest";
import { undefinedType } from "./undefined";

describe("undefined", () => {
  it("should pass on undefined", () => {
    const s = undefinedType();
    expect(s.validateSync(undefined)).toBe(undefined);
  });

  it("should error on non-undefined", () => {
    const s = undefinedType();
    expect(() => s.validateSync("")).toThrowError("Expected undefined");
  });
});
