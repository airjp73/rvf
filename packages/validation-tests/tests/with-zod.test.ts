import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { anyString } from "./util";

describe("withZod", () => {
  it("returns coherent errors for complex schemas", () => {
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

    expect(withZod(schema).validate(obj)).toEqual({
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

  it("returns errors for fields that are unions", () => {
    const schema = z.object({
      field1: z.union([z.literal("foo"), z.literal("bar")]),
      field2: z.union([z.literal("foo"), z.literal("bar")]),
    });
    const obj = {
      field1: "a value",
      // field2 missing
    };

    const validator = withZod(schema);
    expect(validator.validate(obj)).toEqual({
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
    expect(validator.validateField(obj, "field1")).toEqual({
      error: anyString,
    });
    expect(validator.validateField(obj, "field2")).toEqual({
      error: anyString,
    });
  });
});
