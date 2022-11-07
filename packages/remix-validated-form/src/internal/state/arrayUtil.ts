import { getPath, setPath } from "setGet";
import invariant from "tiny-invariant";

////
// All of these array helpers are written in a way that mutates the original array.
// This is because we're working with immer.
////

export const getArray = (values: any, field: string): unknown[] => {
  const value = getPath(values, field);
  if (value === undefined || value === null) {
    const newValue: unknown[] = [];
    setPath(values, field, newValue);
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

  const hasItemA = indexA in array;
  const hasItemB = indexB in array;

  // If we're dealing with a sparse array (i.e. one of the indeces doesn't exist),
  // we should keep it sparse
  if (hasItemA) {
    array[indexB] = itemA;
  } else {
    delete array[indexB];
  }

  if (hasItemB) {
    array[indexA] = itemB;
  } else {
    delete array[indexA];
  }
};

// A splice that can handle sparse arrays
function sparseSplice(
  array: unknown[],
  start: number,
  deleteCount: number,
  item?: unknown
) {
  // Inserting an item into an array won't behave as we need it to if the array isn't
  // at least as long as the start index. We can force the array to be long enough like this.
  if (array.length < start && item) {
    array.length = start;
  }

  // If we just pass item in, it'll be undefined and splice will delete the item.
  if (arguments.length === 4) return array.splice(start, deleteCount, item);
  return array.splice(start, deleteCount);
}

export const move = (array: unknown[], from: number, to: number) => {
  const [item] = sparseSplice(array, from, 1);
  sparseSplice(array, to, 0, item);
};

export const insert = (array: unknown[], index: number, value: unknown) => {
  sparseSplice(array, index, 0, value);
};

export const remove = (array: unknown[], index: number) => {
  sparseSplice(array, index, 1);
};

export const replace = (array: unknown[], index: number, value: unknown) => {
  sparseSplice(array, index, 1, value);
};

/**
 * The purpose of this helper is to make it easier to update `fieldErrors` and `touchedFields`.
 * We key those objects by full paths to the fields.
 * When we're doing array mutations, that makes it difficult to update those objects.
 */
export const mutateAsArray = (
  field: string,
  obj: Record<string, any>,
  mutate: (arr: any[]) => void
) => {
  const beforeKeys = new Set<string>();
  const arr: any[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith(field) && key !== field) {
      beforeKeys.add(key);
      setPath(arr, key.substring(field.length), value);
    }
  }

  mutate(arr);
  for (const key of beforeKeys) {
    delete obj[key];
  }

  const newKeys = getDeepArrayPaths(arr);
  for (const key of newKeys) {
    const val = getPath(arr, key);
    obj[`${field}${key}`] = val;
  }
};

const getDeepArrayPaths = (obj: any, basePath: string = ""): string[] => {
  // This only needs to handle arrays and plain objects
  // and we can assume the first call is always an array.

  if (Array.isArray(obj)) {
    return obj.flatMap((item, index) =>
      getDeepArrayPaths(item, `${basePath}[${index}]`)
    );
  }

  if (typeof obj === "object") {
    return Object.keys(obj).flatMap((key) =>
      getDeepArrayPaths(obj[key], `${basePath}.${key}`)
    );
  }

  return [basePath];
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  // Count the actual number of items in the array
  // instead of just getting the length.
  // This is useful for validating that sparse arrays are handled correctly.
  const countArrayItems = (arr: any[]) => {
    let count = 0;
    arr.forEach(() => count++);
    return count;
  };

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
      arr[0] = true;
      swap(arr, 0, 2);

      expect(countArrayItems(arr)).toEqual(1);
      expect(0 in arr).toBe(false);
      expect(2 in arr).toBe(true);
      expect(arr[2]).toEqual(true);
    });
  });

  describe("move", () => {
    it("should move an item to a new index", () => {
      const array = [1, 2, 3];
      move(array, 0, 1);
      expect(array).toEqual([2, 1, 3]);
    });

    it("should work with sparse arrays", () => {
      const array = [1];
      move(array, 0, 2);

      expect(countArrayItems(array)).toEqual(1);
      expect(array).toEqual([undefined, undefined, 1]);
    });
  });

  describe("insert", () => {
    it("should insert an item at a new index", () => {
      const array = [1, 2, 3];
      insert(array, 1, 4);
      expect(array).toEqual([1, 4, 2, 3]);
    });

    it("should be able to insert falsey values", () => {
      const array = [1, 2, 3];
      insert(array, 1, null);
      expect(array).toEqual([1, null, 2, 3]);
    });

    it("should handle sparse arrays", () => {
      const array: any[] = [];
      array[2] = true;
      insert(array, 0, true);

      expect(countArrayItems(array)).toEqual(2);
      expect(array).toEqual([true, undefined, undefined, true]);
    });
  });

  describe("remove", () => {
    it("should remove an item at a given index", () => {
      const array = [1, 2, 3];
      remove(array, 1);
      expect(array).toEqual([1, 3]);
    });

    it("should handle sparse arrays", () => {
      const array: any[] = [];
      array[2] = true;
      remove(array, 0);

      expect(countArrayItems(array)).toEqual(1);
      expect(array).toEqual([undefined, true]);
    });
  });

  describe("replace", () => {
    it("should replace an item at a given index", () => {
      const array = [1, 2, 3];
      replace(array, 1, 4);
      expect(array).toEqual([1, 4, 3]);
    });

    it("should handle sparse arrays", () => {
      const array: any[] = [];
      array[2] = true;
      replace(array, 0, true);
      expect(countArrayItems(array)).toEqual(2);
      expect(array).toEqual([true, undefined, true]);
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

    it("should swap sparse arrays", () => {
      const values = {
        myField: "something",
        "myField[0]": "foo",
        otherField: "baz",
        "otherField[0]": "something else",
      };
      mutateAsArray("myField", values, (arr) => {
        swap(arr, 0, 2);
      });
      expect(values).toEqual({
        myField: "something",
        "myField[2]": "foo",
        otherField: "baz",
        "otherField[0]": "something else",
      });
    });

    it("should handle arrays with nested values", () => {
      const values = {
        myField: "something",
        "myField[0].title": "foo",
        "myField[0].note": "bar",
        "myField[2].title": "other",
        "myField[2].note": "other",
        otherField: "baz",
        "otherField[0]": "something else",
      };
      mutateAsArray("myField", values, (arr) => {
        swap(arr, 0, 2);
      });
      expect(values).toEqual({
        myField: "something",
        "myField[0].title": "other",
        "myField[0].note": "other",
        "myField[2].title": "foo",
        "myField[2].note": "bar",
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

  describe("getDeepArrayPaths", () => {
    it("should return all paths recursively", () => {
      const obj = [
        true,
        true,
        [true, true],
        { foo: true, bar: { baz: true, test: [true] } },
      ];

      expect(getDeepArrayPaths(obj, "myField")).toEqual([
        "myField[0]",
        "myField[1]",
        "myField[2][0]",
        "myField[2][1]",
        "myField[3].foo",
        "myField[3].bar.baz",
        "myField[3].bar.test[0]",
      ]);
    });
  });
}
