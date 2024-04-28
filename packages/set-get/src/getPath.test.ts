import { describe, test, expect } from "vitest";
import { getPath } from "./getPath";

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

describe("getPath", () => {
  test("should get value at path", () => {
    expect(getPath(obj, "a.b.c")).toBe(1);
    expect(getPath(obj, "a.e[0].f")).toEqual({ g: 1 });
  });

  test("should get a deeply nested value", () => {
    const state = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    expect(getPath(state, "a.b.c")).toBe(1);
  });

  test("should return undefined if the path is not found", () => {
    const state = {
      a: {
        b: {
          c: 1,
        },
      },
    };
    expect(getPath(state, "a.b.d.f.g")).toBeUndefined();
  });

  test("should work with arrays", () => {
    const state = {
      a: {
        b: [1, 2, { c: 3 }],
      },
    };
    expect(getPath(state, "a.b.1")).toBe(2);
    expect(getPath(state, "a.b.2.c")).toBe(3);
    expect(getPath(state, "a.b.3.e")).toBeUndefined();
  });
});
