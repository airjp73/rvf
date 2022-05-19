import { describe, it, expect } from "vitest";
import { expectNumber } from "../testHelpers";
import { number } from "./number";

describe("number", () => {
  it("should pass numbers", () => {
    expect(number().validateSync(1)).toBe(1);
    expect(number().validateSync(123)).toBe(123);

    expectNumber(number().validateSync(1));
  });

  it("should fail numbers", () => {
    expect(() => number().validateSync("1")).toThrowError("Expected a number");
    expect(() => number("Should be a number").validateSync("1")).toThrowError(
      "Should be a number"
    );
    expect(() =>
      number()
        .withMeta({ [number.errorMetaKeys.typeError]: "Error from meta" })
        .validateSync("1")
    ).toThrowError("Error from meta");
    expect(() =>
      number().withMeta({ label: "This number" }).validateSync("")
    ).toThrowError("Expected This number to be a number");
  });
});

describe("max", () => {
  it("should pass numbers less than or equal to the maximum", () => {
    const s = number().max(10);
    expect(s.validateSync(1)).toBe(1);
    expect(s.validateSync(9)).toBe(9);
    expect(s.validateSync(10)).toBe(10);
    expect(s.validateSync(-100)).toBe(-100);
  });

  it("should fail numbers that are too big", () => {
    expect(() => number().max(10).validateSync(11)).toThrow(
      "Should be no more than 10"
    );
    expect(() => number().max(10).label("This num").validateSync(11)).toThrow(
      "This num should be no more than 10"
    );
    expect(() => number().max(10, "Too big").validateSync(11)).toThrow(
      "Too big"
    );
  });
});

describe("min", () => {
  it("should pass numbers greater than or equal to the minimum", () => {
    const s = number().min(0);
    expect(s.validateSync(1)).toBe(1);
    expect(s.validateSync(9)).toBe(9);
    expect(s.validateSync(10)).toBe(10);
    expect(s.validateSync(100)).toBe(100);
  });

  it("should fail numbers that are too small", () => {
    expect(() => number().min(0).validateSync(-1)).toThrow(
      "Should be at least 0"
    );
    expect(() => number().min(0).label("This num").validateSync(-100)).toThrow(
      "This num should be at least 0"
    );
    expect(() => number().min(0, "Too small").validateSync(-999)).toThrow(
      "Too small"
    );
  });
});
