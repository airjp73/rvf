import lodashGet from "lodash/get";
import lodashSet from "lodash/set";
import invariant from "tiny-invariant";

////
// All of these array helpers are written in a way that mutates the original array.
// This is because we're working with immer.
////

export const getArray = (values: any, field: string): unknown[] => {
  const value = lodashGet(values, field);
  if (value === undefined || value === null) {
    const newValue: unknown[] = [];
    lodashSet(values, field, newValue);
    return newValue;
  }
  invariant(
    Array.isArray(value),
    `FieldArray: defaultValue value for ${field} must be an array, null, or undefined`
  );
  return value;
};

export const swap = (array: unknown[], indexA: number, indexB: number) => {
  const itemA = array[indexA];
  const itemB = array[indexB];
  array[indexA] = itemB;
  array[indexB] = itemA;
};

export const move = (array: unknown[], from: number, to: number) => {
  const [item] = array.splice(from, 1);
  array.splice(to, 0, item);
};

export const insert = (array: unknown[], index: number, value: unknown) => {
  array.splice(index, 0, value);
};

export const remove = (array: unknown[], index: number) => {
  array.splice(index, 1);
};

export const replace = (array: unknown[], index: number, value: unknown) => {
  array.splice(index, 1, value);
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("getArray", () => {
    it("shoud get a deeply nested array that can be mutated to update the nested value", () => {
      const values = {
        d: [
          { foo: "bar", baz: [true, false] },
          { e: true, f: "hi" },
        ],
      };
      const result = getArray(values, "d[0].baz");
      const finalValues = {
        d: [
          { foo: "bar", baz: [true, false, true] },
          { e: true, f: "hi" },
        ],
      };

      expect(result).toEqual([true, false]);
      result.push(true);
      expect(values).toEqual(finalValues);
    });

    it("should return an empty array that can be mutated if result is null or undefined", () => {
      const values = {};
      const result = getArray(values, "a.foo[0].bar");
      const finalValues = {
        a: { foo: [{ bar: ["Bob ross"] }] },
      };

      expect(result).toEqual([]);
      result.push("Bob ross");
      expect(values).toEqual(finalValues);
    });

    it("should throw if the value is defined and not an array", () => {
      const values = { foo: "foo" };
      expect(() => getArray(values, "foo")).toThrow();
    });
  });

  describe("swap", () => {
    it("should swap two items", () => {
      const array = [1, 2, 3];
      swap(array, 0, 1);
      expect(array).toEqual([2, 1, 3]);
    });
  });

  describe("move", () => {
    it("should move an item to a new index", () => {
      const array = [1, 2, 3];
      move(array, 0, 1);
      expect(array).toEqual([2, 1, 3]);
    });
  });

  describe("insert", () => {
    it("should insert an item at a new index", () => {
      const array = [1, 2, 3];
      insert(array, 1, 4);
      expect(array).toEqual([1, 4, 2, 3]);
    });
  });

  describe("remove", () => {
    it("should remove an item at a given index", () => {
      const array = [1, 2, 3];
      remove(array, 1);
      expect(array).toEqual([1, 3]);
    });
  });

  describe("replace", () => {
    it("should replace an item at a given index", () => {
      const array = [1, 2, 3];
      replace(array, 1, 4);
      expect(array).toEqual([1, 4, 3]);
    });
  });
}
