import { describe, expect, it } from "vitest";
import { AnySchema, makeType } from "./core";
import { commonMethods } from "./helpers/common";
import { string } from "./helpers/string";

describe("core", () => {
  it("should be able to transform and continue chaining", () => {
    const schema = string()
      .maxLength(5)
      .toNumber()
      .max(55555)
      .transform((val: number) => val - 100);
    expect(schema.validateSync("10100")).toEqual(10000);
    expect(() => schema.validateSync("123456")).toThrow();
    expect(() => schema.validateSync("55556")).toThrow();
    expect(() => schema.validateSync(123)).toThrow();
  });

  it("should be able to set meta", () => {
    const schema = string().label("hi");
    expect(schema.meta).toEqual({ label: "hi" });
  });

  it("should be able to use metadata in errors in any order", () => {
    const testType = makeType(
      (val): val is unknown => true,
      () => "Should not be called",
      {
        raiseError<Self extends AnySchema>(this: Self) {
          return this.check(
            () => false,
            (_, meta) => `This error is for field ${meta.label}`
          );
        },
        ...commonMethods,
      }
    );

    const pipeline1 = testType.raiseError().label("MyField");
    const pipeline2 = testType.label("MyField").raiseError();

    expect(() => pipeline1.validateSync("123")).toThrow(
      "This error is for field MyField"
    );
    expect(() => pipeline2.validateSync("123")).toThrow(
      "This error is for field MyField"
    );
  });

  it("should use last metadata when set in 2 places", () => {
    const testType = makeType(
      (val): val is unknown => true,
      () => "Should not be called",
      {
        testCheck<Self extends AnySchema>(this: Self) {
          return this.check(
            (val: string) => val.length >= 5,
            (val, meta) => `${meta.label} must be at least 5 characters`
          );
        },
        ...commonMethods,
      }
    );

    const longString = testType.label("longString").testCheck();
    const myString = longString.label("myString");

    expect(() => myString.validateSync("1")).toThrow(
      "myString must be at least 5 characters"
    );

    const string2 = testType.as(longString).label("myString");
    expect(() => string2.validateSync("1")).toThrow(
      "myString must be at least 5 characters"
    );
  });
});
