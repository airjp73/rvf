export const sparseCopy = <T>(array: T[]): T[] => array.slice();

// Immer doesn't actually handle sparse arrays correctly, so we need to do
// non-mutative array swapping
export const toSwapped = <T>(array: T[], indexA: number, indexB: number) => {
  const itemA = array[indexA];
  const itemB = array[indexB];

  const hasItemA = indexA in array;
  const hasItemB = indexB in array;

  const updatedArray = [...array];

  // If we're dealing with a sparse array (i.e. one of the indeces doesn't exist),
  // we should keep it sparse
  if (hasItemA) {
    updatedArray[indexB] = itemA;
  } else {
    delete updatedArray[indexB];
  }

  if (hasItemB) {
    updatedArray[indexA] = itemB;
  } else {
    delete updatedArray[indexA];
  }

  return updatedArray;
};

// A splice that can handle sparse arrays
function sparseSplice(
  array: unknown[],
  start: number,
  deleteCount?: number,
  item?: unknown,
) {
  // Inserting an item into an array won't behave as we need it to if the array isn't
  // at least as long as the start index. We can force the array to be long enough like this.
  if (array.length < start && item) {
    array.length = start;
  }

  // If we just pass item in, it'll be undefined and splice will delete the item.
  if (arguments.length === 4) return array.splice(start, deleteCount!, item);
  else if (arguments.length === 3) return array.splice(start, deleteCount);
  return array.splice(start);
}

export const move = (array: unknown[], from: number, to: number) => {
  const [item] = sparseSplice(array, from, 1);
  sparseSplice(array, to, 0, item);
};

export const insert = (array: unknown[], index: number, value: unknown) => {
  sparseSplice(array, index, 0, value);
};

export const insertEmpty = (array: unknown[], index: number) => {
  const tail = sparseSplice(array, index);
  tail.forEach((item, i) => {
    sparseSplice(array, index + i + 1, 0, item);
  });
};

export const remove = (array: unknown[], index: number) => {
  sparseSplice(array, index, 1);
};

export const replace = (array: unknown[], index: number, value: unknown) => {
  sparseSplice(array, index, 1, value);
};
