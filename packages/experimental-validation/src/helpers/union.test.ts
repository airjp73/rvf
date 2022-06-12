import { describe, expect, it } from "vitest";
import { SchemaOf } from "../core";
import { expectType } from "../testHelpers";
import { number } from "./number";
import { string } from "./string";
import { union } from "./union";

describe("union", () => {
  it("should pass if one of the schemas passes", () => {
    const s = union([string(), number()]);
    expectType<SchemaOf<string | number>>(s);

    const strRes = s.validateSync("1");
    expectType<string | number>(strRes);
    expect(strRes).toBe("1");

    const numRes = s.validateSync(1);
    expectType<string | number>(numRes);
    expect(numRes).toBe(1);
  });

  it("should fail if none of the schemas pass", () => {
    const s = union([string(), number()]);

    // TODO: Need to support returning multiple errors
    // Need a better story around collecting error messages in general
    expect(() => s.validateSync(true)).toThrowError("Expected a number");
  });
});
