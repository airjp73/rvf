import { TestFormData } from "@remix-validated-form/test-utils";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as core from "@zod/core";
import * as zfd from "./api";
import * as schemas from "./schemas";

const safeParse = core.safeParse;

const expectValid = (schema: core.$ZodType, val: any) => {
  expect(safeParse(schema, val)).toEqual({
    success: true,
    data: val,
  });
};

describe("form data", () => {
  it("should parse regular objects", () => {
    expectValid(
      zfd._formData(schemas.$ZfdFormData, {
        foo: core._string(core.$ZodString),
      }),
      { foo: "bar" },
    );
  });

  it("should parse FormData", () => {
    const schema = zfd._formData(schemas.$ZfdFormData, {
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
    const schema = zfd._formData(
      schemas.$ZfdFormData,
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
    const schema = zfd._checkbox(schemas.$ZfdCheckbox);
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
    const schema = zfd._checkbox(schemas.$ZfdCheckbox, {
      trueValue: "changed" as any,
    });
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

describe("text", () => {
  it("should fail on empty string", () => {
    const schema = zfd._text(schemas.$ZfdTextInput);
    expect(safeParse(schema, "", { reportInput: true })).toMatchObject({
      success: false,
      error: {
        issues: [{ code: "invalid_type", input: undefined }],
      },
    });
  });

  it("should fail on undefined", () => {
    const schema = zfd._text(schemas.$ZfdTextInput);
    expect(safeParse(schema, undefined, { reportInput: true })).toMatchObject({
      success: false,
      error: {
        issues: [{ code: "invalid_type", input: undefined }],
      },
    });
  });

  it("should succeed otherwise", () => {
    const schema = zfd._text(schemas.$ZfdTextInput);
    expect(safeParse(schema, "test", { reportInput: true })).toEqual({
      success: true,
      data: "test",
    });
  });
});
