import { describe, expect, it } from "vitest";
import { SchemaOf } from "../core";
import { expectType } from "../testHelpers";
import { unknownType } from "./unknown";

describe("unknown", () => {
  it("should always pass", () => {
    const s = unknownType;
    expectType<SchemaOf<unknown>>(s);
    expectType<unknown>(s.validateSync("something"));

    expect(s.validateSync(1)).toBe(1);
    expect(s.validateSync("1")).toBe("1");
    expect(s.validateSync(true)).toBe(true);
    expect(s.validateSync(null)).toBe(null);
    expect(s.validateSync(undefined)).toBe(undefined);
    expect(s.validateSync({})).toEqual({});
    expect(s.validateSync([])).toEqual([]);
  });
});
