import { describe, it, expect } from "vitest";

import { checkbox } from "./checkbox";
import { expectError } from "../test/lib";

describe("zfd v4 checkbox", () => {
  it("should interperet 'on' as true", () => {
    const s = checkbox();
    expect(s.parse("on")).toBe(true);
  });

  it("should interperet 'undefined' as false", () => {
    const s = checkbox();
    expect(s.parse(undefined)).toBe(false);
  });

  it("should fail on other strings", () => {
    const s = checkbox();
    expectError(s, "asdf");
  });

  it("should support custom true values", () => {
    const s = checkbox({ trueValue: "asdf" });
    expect(s.parse("asdf")).toBe(true);
  });

  it("should support boolean values", () => {
    const s = checkbox();
    expect(s.parse(true)).toBe(true);
    expect(s.parse(false)).toBe(false);
  });

  it("should fail anything else", () => {
    const s = checkbox();
    expectError(s, 123);
  });
});
