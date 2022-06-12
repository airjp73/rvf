import { describe, expect, it } from "vitest";
import { SchemaOf } from "../core";
import { expectType } from "../testHelpers";
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

describe("optional", () => {
  it("should pass if value is undefined", () => {
    const s = string().optional();
    expectType<SchemaOf<string | undefined>>(s);
    expectType<string | undefined>(s.validateSync(undefined));

    expect(s.validateSync(undefined)).toBe(undefined);
    expect(s.validateSync("hi")).toBe("hi");
  });

  it("should still fail if invalid type", () => {
    const s = string().optional();
    expect(() => s.validateSync(1)).toThrowError("Expected a string");
  });
});
