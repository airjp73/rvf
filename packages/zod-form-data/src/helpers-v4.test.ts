import { TestFormData } from "@remix-validated-form/test-utils";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as z from "@zod/mini";
import * as core from "@zod/core";
import * as zfd from "./helpers-v4";

// const expectError = (schema: core.$ZodType<any>, val: any, error?: core.$ZodError) => {
//   expect(schema.safeParse(val)).toMatchObject({
//     error: error ? error : expect.any(z.ZodError),
//     success: false,
//   });
// };

const safeParse = core.safeParse;

const expectValid = (schema: core.$ZodType, val: any) => {
  expect(safeParse(schema, val)).toEqual({
    success: true,
    data: val,
  });
};

describe("v4 helpers", () => {
  it("should parse regular objects", () => {
    expectValid(
      zfd.formData({
        foo: core._string(core.$ZodString),
      }),
      { foo: "bar" },
    );
  });

  it("should parse FormData", () => {
    const schema = zfd.formData({
      foo: core._string(core.$ZodString),
    });
    const formData = new TestFormData();
    formData.append("foo", "bar");
    expect(safeParse(schema, formData)).toEqual({
      success: true,
      data: { foo: "bar" },
    });
  });
});
