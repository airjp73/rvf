import lodashGet from "lodash/get";
import has from "lodash/has";
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

export const mutateAsArray = (
  field: string,
  obj: Record<string, any>,
  mutate: (arr: any[]) => void
) => {
  const keys = new Set<string>();
  const arr: any[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith(field)) {
      keys.add(key);
    }
    lodashSet(arr, key.substring(field.length), value);
  }

  mutate(arr);
  for (const key of keys) {
    delete obj[key];
  }

  for (const key of keys) {
    const subKey = key.substring(field.length);
    if (has(arr, subKey)) {
      const val = lodashGet(arr, subKey);
      obj[key] = val;
    }
  }
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

    it("should work for sparse arrays", () => {
      // A bit of a sanity check for native array behavior
      const arr = [] as any[];
      arr[0] = 1;
      arr[2] = 2;
      swap(arr, 0, 2);

      let count = 0;
      arr.forEach(() => count++);
      expect(count).toEqual(2);
      expect(arr.length).toEqual(3);
      expect(arr).toEqual([2, undefined, 1]);
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

  describe("mutateAsArray", () => {
    it("should handle swap", () => {
      const values = {
        myField: "something",
        "myField[0]": "foo",
        "myField[2]": "bar",
        otherField: "baz",
        "otherField[0]": "something else",
      };
      mutateAsArray("myField", values, (arr) => {
        swap(arr, 0, 2);
      });
      expect(values).toEqual({
        myField: "something",
        "myField[0]": "bar",
        "myField[2]": "foo",
        otherField: "baz",
        "otherField[0]": "something else",
      });
    });

    it("should handle move", () => {
      const values = {
        myField: "something",
        "myField[0]": "foo",
        "myField[1]": "bar",
        "myField[2]": "baz",
        "otherField[0]": "something else",
      };
      mutateAsArray("myField", values, (arr) => {
        move(arr, 0, 2);
      });
      expect(values).toEqual({
        myField: "something",
        "myField[0]": "bar",
        "myField[1]": "baz",
        "myField[2]": "foo",
        "otherField[0]": "something else",
      });
    });

    it("should handle remove", () => {
      const values = {
        myField: "something",
        "myField[0]": "foo",
        "myField[1]": "bar",
        "myField[2]": "baz",
        "otherField[0]": "something else",
      };
      mutateAsArray("myField", values, (arr) => {
        remove(arr, 1);
      });
      expect(values).toEqual({
        myField: "something",
        "myField[0]": "foo",
        "myField[1]": "baz",
        "otherField[0]": "something else",
      });
      expect("myField[2]" in values).toBe(false);
    });
  });
}
