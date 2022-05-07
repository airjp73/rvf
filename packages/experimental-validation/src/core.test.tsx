import { describe, expect, it } from "vitest";
import { check, transform } from "./core";
import { label } from "./helpers/common";
import * as n from "./helpers/number";
import * as s from "./helpers/string";

describe("core", () => {
  it("should be able to compose pipelines together", () => {
    const pipeline = s
      .string()
      .e(s.maxLength(5))
      .e(s.toNumber())
      .e(n.max(55555))
      .e(transform((val: number) => val - 100));
    expect(pipeline.validateSync("10100")).toEqual(10000);
    expect(() => pipeline.validateSync("123456")).toThrow();
    expect(() => pipeline.validateSync("55556")).toThrow();
    expect(() => pipeline.validateSync(123)).toThrow();
  });

  it("should be able to set meta", () => {
    const pipeline = s.string().e(label("hi"));
    expect(pipeline.meta).toEqual({ label: "hi" });
  });

  it("should be able to use metadata in errors in any order", () => {
    const raiseError = check(
      () => false,
      (_, meta) => `This error is for field ${meta.label}`
    );
    const testLabel = label("MyField");

    const pipeline1 = s.string().e(raiseError).e(testLabel);
    const pipeline2 = s.string().e(testLabel).e(raiseError);

    expect(() => pipeline1.validateSync("123")).toThrow(
      "This error is for field MyField"
    );
    expect(() => pipeline2.validateSync("123")).toThrow(
      "This error is for field MyField"
    );
  });

  it("should use last metadata when set in 2 places", () => {
    const testCheck = check(
      (val: string) => val.length >= 5,
      (val, meta) => `${meta.label} must be at least 5 characters`
    );
    const longString = s.string().e(label("longString")).e(testCheck);
    const myString = longString.e(label("myString"));

    expect(() => myString.validateSync("1")).toThrow(
      "myString must be at least 5 characters"
    );

    const string2 = s.string().e(longString).e(label("myString"));
    expect(() => string2.validateSync("1")).toThrow(
      "myString must be at least 5 characters"
    );
  });
});
