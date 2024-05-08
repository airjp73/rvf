import { ReactNode } from "react";
import { FormStoreValue, Rvf, scopeRvf } from "@rvf/core";
import { useStore } from "zustand";
import { makeImplFactory } from "./implFactory";
import { RvfField, makeFieldImpl } from "./field";

export interface RvfArray<FormInputData extends Array<any>> {
  /**
   * Gets the length of the array.
   * @willRerender
   */
  length: () => number;

  /**
   * Maps over and renders the array items.
   * Using the `form` parameter passed to the callback will isolate rerenders to each individual item.
   * Changes to the length of the array will also be isoated to this `map` call.
   */
  map: (
    callback: (
      key: string,
      form: RvfField<FormInputData[number]>,
      index: number,
    ) => ReactNode,
  ) => ReactNode;

  /**
   * Adds an item to the array. Just like `Array.push`.
   */
  push: (value: FormInputData[number]) => void;

  /**
   * Pops the last item in the array. Similar to `Array.pop`.
   */
  pop: () => void;

  /**
   * Removes the first item in the array. Similar to `Array.shift`.
   */
  shift: () => void;

  /**
   * Inserts an item at the start of the array. Just like `Array.unshift`.
   */
  unshift: (value: FormInputData[number]) => void;

  /**
   * Inserts an item at a specific index in the array.
   */
  insert: (index: number, value: FormInputData[number]) => void;

  /**
   * Moves an item from `fromIndex` to `toIndex` in the array.
   * This process happens by removing the item at `fromIndex` and inserting it at `toIndex`.
   * Keep this in mind if your `toIndex` is after the `fromIndex`.
   */
  move: (fromIndex: number, toIndex: number) => void;

  /**
   * Removes an item from the array.
   */
  remove: (index: number) => void;

  /**
   * Swaps the items at `fromIndex` and `toIndex` in the array.
   */
  swap: (fromIndex: number, toIndex: number) => void;

  /**
   * Replaces an item in the array.
   * The new value will be treated as a new field, which will reset any `touched`, `dirty`, or `validationErrors` for the item.
   * It will also generate a new key for the item.
   */
  replace: (index: number, value: FormInputData[number]) => void;
}

export type FieldArrayParams<FormInputData> = {
  form: Rvf<FormInputData>;
  arrayFieldName: string;
  trackedState: FormStoreValue;
};

export const makeFieldArrayImpl = <FormInputData extends Array<any>>({
  form,
  arrayFieldName,
  trackedState,
}: FieldArrayParams<FormInputData>): RvfArray<FormInputData> => {
  const itemImpl = makeImplFactory(arrayFieldName, (itemFieldName) =>
    makeFieldImpl({
      form: scopeRvf(form, itemFieldName) as Rvf<FormInputData[number]>,
      fieldName: itemFieldName,
      trackedState,
    }),
  );

  return {
    length: () => trackedState.getFieldArrayKeys(arrayFieldName).length,
    map: (callback) => {
      return trackedState
        .getFieldArrayKeys(arrayFieldName)
        .map((key, index) => {
          const itemRvf = itemImpl(String(index));
          return callback(key, itemRvf, index);
        });
    },
    push: (value) => trackedState.arrayPush(arrayFieldName, value),
    pop: () => trackedState.arrayPop(arrayFieldName),
    shift: () => trackedState.arrayShift(arrayFieldName),
    unshift: (value) => trackedState.arrayUnshift(arrayFieldName, value),
    insert: (index, value) =>
      trackedState.arrayInsert(arrayFieldName, index, value),
    move: (fromIndex, toIndex) =>
      trackedState.arrayMove(arrayFieldName, fromIndex, toIndex),
    remove: (index) => trackedState.arrayRemove(arrayFieldName, index),
    swap: (fromIndex, toIndex) =>
      trackedState.arraySwap(arrayFieldName, fromIndex, toIndex),
    replace: (index, value) =>
      trackedState.arrayReplace(arrayFieldName, index, value),
  };
};

const IsolatedMap = ({
  form,
  render,
}: {
  form: Rvf<unknown>;
  render: (form: string[]) => ReactNode;
}) => {
  const keys = useStore(form.__store__.store, (state) =>
    state.getFieldArrayKeys(form.__field_prefix__),
  );
  return render(keys);
};
