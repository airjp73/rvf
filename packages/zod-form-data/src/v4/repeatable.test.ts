import { describe, it, expect } from "vitest";
import { z } from "zod";
import * as core from "zod/v4/core";

import { numeric } from "./numeric";
import { repeatable, repeatableOfType } from "./repeatable";
import { expectError } from "../test/lib";
import { text } from "./text";

describe("zfd v4 repeatable", () => {
  it("should transform single values to arrays", () => {
    const s = repeatable();
    expect(s.parse("asdf")).toEqual(["asdf"]);
  });

  it("should return an array with undefined", () => {
    const s = repeatable();
    expect(s.parse(undefined)).toEqual([]);
  });

  it("should return an array with null", () => {
    const s = repeatable();
    expect(s.parse(null)).toEqual([]);
  });

  it("should leave arrays as arrays", () => {
    const s = repeatable();
    expect(s.parse(["asdf"])).toEqual(["asdf"]);
  });

  it("should respect provided validation", () => {
    const s = repeatable(numeric(z.number().min(13)).array());
    expectError(s, "12");
    expect(s.parse("13")).toEqual([13]);
  });

  it("should result in an empty array if no value is present", () => {
    const s = repeatable(z.any().array());
    expect(s.parse(undefined)).toEqual([]);
    expect(s.parse(null)).toEqual([]);
  });

  it("should handle empty strings", () => {
    const s = repeatable();
    expectError(s, ["", ""]);

    const s2 = repeatable(text(z.string().optional()).array());
    expect(s2.parse(["", ""])).toEqual([undefined, undefined]);
  });
});

describe("repeatableOfType", () => {
  it("should accept schema for item type", () => {
    const s = repeatableOfType(numeric(z.number().min(13)));
    expectError(s, "12");
    expect(s.parse("13")).toEqual([13]);
  });
  it("should fail on multiple items with correct error", () => {
    const s = repeatableOfType(numeric(z.number().positive()));
    expectError(
      s,
      ["adsf", -123],
      new core.$ZodError([
        {
          expected: "number",
          code: "invalid_type",
          path: [0],
          message: "Invalid input: expected number, received string",
        },
        {
          origin: "number",
          code: "too_small",
          minimum: 0,
          inclusive: false,
          path: [1],
          message: "Too small: expected number to be >0",
        },
      ]),
    );
    expect(s.parse("13")).toEqual([13]);
  });
});
