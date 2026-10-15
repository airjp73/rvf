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

  test("should set a deeply nested value", () => {
    const state = {
      a: {
        b: {
          c: 1,
        },
      },
      d: 2,
    };
    setPath(state, "a.b.c", 3);
    expect(state).toEqual({
      a: {
        b: {
          c: 3,
        },
      },
      d: 2,
    });
  });

  test("should create missing objects", () => {
    const state = {
      d: 2,
    };
    setPath(state, "a.b.c", 3);
    expect(state).toEqual({
      a: {
        b: {
          c: 3,
        },
      },
      d: 2,
    });
  });

  test("should create missing arrays", () => {
    const state = {
      d: 2,
    };
    setPath(state, "a.b.c[0]", 3);
    expect(state).toEqual({
      a: {
        b: {
          c: [3],
        },
      },
      d: 2,
    });
  });

  test("should throw when trying to set a forbidden key (intermediate segment)", () => {
    const state = {};
    expect(() => setPath(state, "__proto__.polluted", "yes")).toThrow(
      "Attempted to set a forbidden key: __proto__",
    );
    expect(() => setPath(state, "constructor.polluted", "yes")).toThrow(
      "Attempted to set a forbidden key: constructor",
    );
    expect(() => setPath(state, "prototype.polluted", "yes")).toThrow(
      "Attempted to set a forbidden key: prototype",
    );
    expect(() => setPath(state, "polluted.prototype", "yes")).toThrow(
      "Attempted to set a forbidden key: prototype",
    );
  });

  test("should throw when forbidden key is the terminal segment", () => {
    expect(() => setPath({}, "__proto__", "yes")).toThrow(
      "Attempted to set a forbidden key: __proto__",
    );
    expect(() => setPath({}, "constructor", "yes")).toThrow(
      "Attempted to set a forbidden key: constructor",
    );
    expect(() => setPath({}, "prototype", "yes")).toThrow(
      "Attempted to set a forbidden key: prototype",
    );
  });

  test("should throw when forbidden key is terminal segment in nested path", () => {
    expect(() => setPath({}, "user.__proto__", { isAdmin: true })).toThrow(
      "Attempted to set a forbidden key: __proto__",
    );
    expect(() => setPath({}, "user.constructor", {})).toThrow(
      "Attempted to set a forbidden key: constructor",
    );
  });

  test("should throw when forbidden key is terminal segment via array path", () => {
    expect(() => setPath({}, ["__proto__"], ["A", "B"])).toThrow(
      "Attempted to set a forbidden key: __proto__",
    );
  });

  test("should throw when trying to set a forbidden key via coercion / invalid types", () => {
    const state = {};
    expect(() => setPath(state, [["__proto__"], "polluted"] as any, "yes")).toThrow(
      "Attempted to set a forbidden key: __proto__",
    );
  });
});

describe("prototype pollution prevention", () => {
  test("should not descend into inherited function properties (hasOwnProperty)", () => {
    const before = Object.prototype.hasOwnProperty.call({ foo: "bar" }, "foo");
    const state: Record<string, any> = {};
    setPath(state, "hasOwnProperty.call", "pwned");
    const after = Object.prototype.hasOwnProperty.call({ foo: "bar" }, "foo");
    expect(before).toBe(true);
    expect(after).toBe(true);
    // hasOwnProperty.call should not be set on the created object
    expect((state)["hasOwnProperty"]["call"]).toBe(
      "pwned",
    );
  });

  test("should not descend into inherited function properties (toString)", () => {
    const before = Object.prototype.toString.call([1, 2]);
    const state: Record<string, unknown> = {};
    setPath(state, "toString.call", "pwned");
    const after = Object.prototype.toString.call([1, 2]);
    expect(before).toBe("[object Array]");
    expect(after).toBe("[object Array]");
  });

  test("should not descend into inherited function properties (valueOf)", () => {
    const state: Record<string, unknown> = {};
    setPath(state, "valueOf.pwned", "bar");
    // valueOf should still be a function on Object.prototype
    expect(typeof Object.prototype.valueOf).toBe("function");
  });

  test("should not descend into inherited function properties (isPrototypeOf)", () => {
    const state: Record<string, unknown> = {};
    setPath(state, "isPrototypeOf.pwned", "bar");
    expect(typeof Object.prototype.isPrototypeOf).toBe("function");
  });

  test("should not descend into inherited function properties (propertyIsEnumerable)", () => {
    const state: Record<string, unknown> = {};
    setPath(state, "propertyIsEnumerable.pwned", "bar");
    expect(typeof Object.prototype.propertyIsEnumerable).toBe("function");
  });

  test("should not descend into inherited function properties (toLocalString)", () => {
    const state: Record<string, unknown> = {};
    setPath(state, "toLocaleString.pwned", "bar");
    expect(typeof Object.prototype.toLocaleString).toBe("function");
  });

  test("constructor should still be blocked in the main check", () => {
    expect(() => setPath({}, "constructor.polluted", "yes")).toThrow(
      "Attempted to set a forbidden key: constructor",
    );
  });

  test("should handle form-data-style dotted field names", () => {
    const state: Record<string, unknown> = {};
    setPath(state, "username", "alice");
    setPath(state, "hasOwnProperty.call", "pwned");
    setPath(state, "toString.tag", "hack");

    expect(state).toEqual({
      username: "alice",
      hasOwnProperty: { call: "pwned" },
      toString: { tag: "hack" },
    });

    // Object.prototype methods should still work
    expect(Object.prototype.hasOwnProperty.call(state, "username")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(state, "polluted")).toBe(false);
    expect(Object.prototype.toString.call(state)).toBe("[object Object]");
  });
});
