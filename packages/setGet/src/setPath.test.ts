import { describe, test, expect } from "vitest";
import { setPath } from "./setPath";

interface SampleType {
  a: {
    b: {
      c: number;
      d?: number;
    };
    e: Array<{ f: { g: number } }>;
    z?: number | undefined;
  };
  x?: number;
  y?: number;
}

const obj: SampleType = {
  a: {
    b: {
      c: 1,
    },
    e: [{ f: { g: 1 } }, { f: { g: 1 } }],
  },
  y: 10,
};

describe("string path", () => {
  test("should set a deeply nested value", () => {
    expect<SampleType>(setPath(obj, "a.b.c", 2)).toEqual({
      ...obj,
      a: {
        ...obj.a,
        b: {
          c: 2,
        },
      },
    });
  });

  test("should work nested arrays", () => {
    expect<SampleType>(setPath(obj, "a.e[1].f.g", 2)).toEqual({
      ...obj,
      a: {
        ...obj.a,
        e: [{ f: { g: 1 } }, { f: { g: 2 } }],
      },
    });
  });

  test("should correctly type value argument", () => {
    expect<SampleType>(setPath(obj, "a.e[1].f.g", "hello")).toEqual({
      ...obj,
      a: {
        ...obj.a,
        e: [{ f: { g: 1 } }, { f: { g: "hello" } }],
      },
    });
  });

  test("should correctly type path argument", () => {
    expect<SampleType>(setPath(obj, "a.hello", "hello")).toEqual({
      ...obj,
      a: {
        ...obj.a,
        hello: "hello",
      },
    });
  });

  test("should work with undefined / optional types", () => {
    expect<SampleType>(setPath(obj, "a.z", undefined)).toEqual({
      ...obj,
      a: {
        ...obj.a,
        z: undefined,
      },
    });
  });

  test("should support partial paths", () => {
    expect<SampleType>(setPath(obj, "a.b", { c: 2 })).toEqual({
      ...obj,
      a: {
        ...obj.a,
        b: { c: 2 },
      },
    });
  });

  test("should correctly type partial paths", () => {
    expect<SampleType>(setPath(obj, "a.b", 123)).toEqual({
      ...obj,
      a: {
        ...obj.a,
        b: 123,
      },
    });
  });
});
