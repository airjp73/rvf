import { anyString } from "@remix-validated-form/test-utils";
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { withZod } from "./";

describe("withZod", () => {
  it("returns coherent errors for complex schemas", async () => {
    const schema = z.union([
      z.object({
        type: z.literal("foo"),
        foo: z.string(),
      }),
      z.object({
        type: z.literal("bar"),
        bar: z.string(),
      }),
    ]);
    const obj = {
      type: "foo",
      bar: 123,
      foo: 123,
    };

    expect(await withZod(schema).validate(obj)).toEqual({
      data: undefined,
      error: {
        fieldErrors: {
          type: anyString,
          bar: anyString,
          foo: anyString,
        },
        subaction: undefined,
      },
      submittedData: obj,
    });
  });

  it("returns errors for fields that are unions", async () => {
    const schema = z.object({
      field1: z.union([z.literal("foo"), z.literal("bar")]),
      field2: z.union([z.literal("foo"), z.literal("bar")]),
    });
    const obj = {
      field1: "a value",
      // field2 missing
    };

    const validator = withZod(schema);
    expect(await validator.validate(obj)).toEqual({
      data: undefined,
      error: {
        fieldErrors: {
          field1: anyString,
          field2: anyString,
        },
        subaction: undefined,
      },
      submittedData: obj,
    });
    expect(await validator.validateField(obj, "field1")).toEqual({
      error: anyString,
    });
    expect(await validator.validateField(obj, "field2")).toEqual({
      error: anyString,
    });
  });

  it("returns custom error message when using a custom error map", async () => {
    const schema = z.object({
      type: z.string(),
    });
    const obj = {
      type: 123,
    };

    const errorMap: z.ZodErrorMap = () => ({ message: "Custom error" });

    expect(await withZod(schema, { errorMap }).validate(obj)).toEqual({
      data: undefined,
      error: {
        fieldErrors: {
          type: "Custom error",
        },
        subaction: undefined,
      },
      submittedData: obj,
    });
  });
});
