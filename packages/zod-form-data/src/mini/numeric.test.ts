import { describe, it, expect } from "vitest";
import { z } from "zod/mini";

import { numeric } from "./numeric";
import { expectError, expectValid } from "../test/lib";
import { text } from "./text";

describe("zfd mini numeric", () => {
  it("should interperet an empty string as undefined", () => {
    const s = numeric(z.optional(z.number()));
    expect(s.parse("")).toBeUndefined();
  });

  it("should interperet an empty string as null when 'empty' is set to null", () => {
    const s = numeric(z.nullable(z.number()), null);
    expect(s.parse("")).toBeNull();
  });

  it("should fail a required check with an empty string", () => {
    const s = numeric();
    expectError(s, "");
  });

  it("should coerce valid values into numbers", () => {
    const s = numeric();
    expect(s.parse("123")).toBe(123);
  });

  it("should not touch invalid numbers", () => {
    const s = numeric(z.string());
    expect(s.parse("asdf")).toBe("asdf");
  });

  it("should error on things that would normally error", () => {
    const s = numeric();
    expectError(s, "asdf");
  });

  it("should respect validations from provided schema", () => {
    const s = text(z.number().check(z.minimum(13)));
    expectError(s, 12);
    expectValid(s, 13);
  });
});
