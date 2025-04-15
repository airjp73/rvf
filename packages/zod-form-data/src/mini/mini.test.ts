import * as z from "@zod/mini";
import * as zfd from "./mini";
import { TestFormData } from "@remix-validated-form/test-utils";

describe("form data", () => {
  it("should parse regular objects", () => {
    const schema = zfd.formData({ foo: z.string() });
    expect(schema.safeParse({ foo: "bar" })).toEqual({
      success: true,
      data: {
        foo: "bar",
      },
    });
  });

  it("should parse FormData", () => {
    const schema = zfd.formData({
      foo: z.string(),
    });
    const formData = new TestFormData();
    formData.append("foo", "bar");
    expect(schema.safeParse(formData)).toEqual({
      success: true,
      data: { foo: "bar" },
    });
  });

  it("should allow optional fields", () => {
    const schema = zfd.formData(
      {
        foo: z.string(),
        bar: z.string(),
        baz: z.optional(z.string()),
      },
      {
        optional: ["bar"],
      },
    );
    const formData = new TestFormData();
    formData.append("foo", "bar");
    expect(schema.safeParse(formData)).toEqual({
      success: true,
      data: { foo: "bar" },
    });
  });
});

describe("text", () => {
  it("should fail on empty string", () => {
    const schema = zfd.text();
    expect(schema.safeParse("", { reportInput: true })).toMatchObject({
      success: false,
      error: {
        issues: [{ code: "invalid_type", input: undefined }],
      },
    });
  });

  it("should fail on undefined", () => {
    const schema = zfd.text();
    expect(schema.safeParse(undefined, { reportInput: true })).toMatchObject({
      success: false,
      error: {
        issues: [{ code: "invalid_type", input: undefined }],
      },
    });
  });

  it("should succeed otherwise", () => {
    const schema = zfd.text();
    expect(schema.safeParse("test", { reportInput: true })).toEqual({
      success: true,
      data: "test",
    });
  });

  it("should combo with builtin utils", () => {
    const schema = z.pipe(
      zfd.text().check(z.minLength(3, "Too short")),
      z.transform((t) => t.length),
    );
    expect(schema.safeParse("test", { reportInput: true })).toMatchObject({
      success: true,
      data: 4,
    });
    expect(schema.safeParse("hi", { reportInput: true })).toMatchObject({
      success: false,
      error: {
        issues: [{ code: "too_small", input: "hi", minimum: 3 }],
      },
    });
  });
});
