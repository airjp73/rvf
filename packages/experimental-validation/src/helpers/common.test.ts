import { describe, expect, it } from "vitest";
import { commonMetaKeys } from "./common";
import { string } from "./string";

describe("required", () => {
  it("sanity check", () => {
    const sanity = string();
    expect(() => sanity.validateSync(undefined)).toThrowError(
      "Expected a string"
    );
  });

  it("should show provided error", () => {
    const s = string().required("This is required");
    expect(() => s.validateSync(undefined)).toThrowError("This is required");
  });

  it("should show provided meta func error", () => {
    const s = string()
      .label("This thing")
      .required(({ label }) => `${label} is required`);
    expect(() => s.validateSync(undefined)).toThrowError(
      "This thing is required"
    );
  });

  it("should use meta error", () => {
    const s = string()
      .withMeta({ [commonMetaKeys.requiredError]: "Still required" })
      .required();
    expect(() => s.validateSync(undefined)).toThrowError("Still required");
  });

  it("should pass if value is not undefined", () => {
    const s = string().required();
    expect(s.validateSync("")).toBe("");
  });
});
