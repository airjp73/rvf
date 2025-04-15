import { TestFormData } from "@remix-validated-form/test-utils";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as z from "@zod/mini";
import * as core from "@zod/core";
import * as zfd from "./core";

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

  it("should allow optional fields", () => {
    const schema = zfd.formData(
      {
        foo: core._string(core.$ZodString),
        bar: core._string(core.$ZodString),
        baz: core._optional(
          core.$ZodOptional,
          core._string(core.$ZodString) as any,
        ),
      },
      {
        optional: ["bar"],
      },
    );
    const formData = new TestFormData();
    formData.append("foo", "bar");
    expect(safeParse(schema, formData)).toEqual({
      success: true,
      data: { foo: "bar" },
    });
  });
});

describe("checkbox", () => {
  it("default on", () => {
    const schema = zfd.checkbox();
    expect(safeParse(schema, "on")).toEqual({
      success: true,
      data: true,
    });
    expect(safeParse(schema, "wrong")).toEqual({
      success: false,
      error: {
        issues: [
          {
            code: "invalid_value",
            message: "Invalid input",
            path: [],
            values: ["on", undefined],
          },
        ],
      },
    });
    expect(safeParse(schema, undefined)).toEqual({
      success: true,
      data: false,
    });
  });

  it("configurable true value", () => {
    const schema = zfd.checkbox({ trueValue: "changed" });
    expect(safeParse(schema, "changed")).toEqual({
      success: true,
      data: true,
    });
    expect(safeParse(schema, "on")).toEqual({
      success: false,
      error: {
        issues: [
          {
            code: "invalid_value",
            message: "Invalid input",
            path: [],
            values: ["changed", undefined],
          },
        ],
      },
    });
    expect(safeParse(schema, undefined)).toEqual({
      success: true,
      data: false,
    });
  });
});
