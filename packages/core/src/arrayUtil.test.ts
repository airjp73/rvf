// Count the actual number of items in the array
// instead of just getting the length.

import {
  insert,
  insertEmpty,
  move,
  remove,
  replace,
  toSwapped,
} from "./arrayUtil";

// This is useful for validating that sparse arrays are handled correctly.
const countArrayItems = (arr: any[]) => {
  let count = 0;
  arr.forEach(() => count++);
  return count;
};

describe("swap", () => {
  it("should swap two items", () => {
    const array = [1, 2, 3];
    expect(toSwapped(array, 0, 1)).toEqual([2, 1, 3]);
  });

  it("should work for sparse arrays", () => {
    // A bit of a sanity check for native array behavior
    let arr = [] as any[];
    arr[0] = true;
    arr = toSwapped(arr, 0, 2);

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

describe("insertEmpty", () => {
  it("should insert an empty item at a given index", () => {
    const array = [1, 2, 3];
    insertEmpty(array, 1);
    // eslint-disable-next-line no-sparse-arrays
    expect(array).toStrictEqual([1, , 2, 3]);
    expect(array).not.toStrictEqual([1, undefined, 2, 3]);
  });

  it("should work with already sparse arrays", () => {
    // eslint-disable-next-line no-sparse-arrays
    const array = [, , 1, , 2, , 3];
    insertEmpty(array, 3);
    // eslint-disable-next-line no-sparse-arrays
    expect(array).toStrictEqual([, , 1, , , 2, , 3]);
    expect(array).not.toStrictEqual([
      undefined,
      undefined,
      1,
      undefined,
      undefined,
      2,
      undefined,
      3,
    ]);
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
