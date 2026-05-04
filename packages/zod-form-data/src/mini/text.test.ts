import { describe, it, expect, expectTypeOf } from "vitest";
import { z } from "zod/mini";

import { expectError, expectValid } from "../test/lib";
import { text } from "./text";

describe("zfd mini text", () => {
  it("should interperet an empty string as undefined", () => {
    const s = text(z.optional(z.string()));
    expect(s.parse("")).toBeUndefined();
  });

  it("should interperet an empty string as null with 'empty' set to null", () => {
    const s = text(z.nullable(z.string()), null);
    expect(s.parse("")).toBeNull();
  });

  it("should fail a required check with an empty string", () => {
    const s = text();
    expectError(s, "");
  });

  it("should return the value if a non-empty string", () => {
    const s = text();
    expect(s.parse("Something valid")).toBe("Something valid");
  });

  it("should not touch non-strings", () => {
    const s = text(z.number());
    expect(s.parse(123)).toBe(123);
  });

  it("should error on anything else that would normally error", () => {
    const s = text();
    expectError(s, 123);
  });

  it("should respect validations from provided schema", () => {
    const s = text(z.email());
    expectError(s, "hi!");
    expectValid(s, "testing@example.com");
  });

  it("should validate enum and pass the output type along correctly", () => {
    const values = ["hello", "world"] as const;
    const enumSchema = z.enum(values);
    const schema = text(enumSchema);
    type EnumSchemaOutput = z.output<typeof enumSchema>;
    type SchemaOutput = z.output<typeof schema>;

    expectValid(schema, "hello");
    expectValid(schema, "world");
    expectError(schema, "plop");

    expectTypeOf<SchemaOutput>().toEqualTypeOf<EnumSchemaOutput>();
  });
});
