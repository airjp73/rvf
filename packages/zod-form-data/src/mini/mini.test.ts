import * as zfd from "./mini";

describe("text", () => {
  it("should work", () => {
    const schema = zfd.text();
    expect(schema.parse("hi")).toEqual("hi");
    expect(schema.safeParse("")).toMatchObject({
      success: false,
      error: {
        issues: [{ code: "invalid_type" }],
      },
    });
  });
});
