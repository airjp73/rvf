import * as z from "@zod/mini";
import * as zfd from "./mini";

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
