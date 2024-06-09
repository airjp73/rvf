import { ReactNode, useMemo } from "react";
import {
  FormStoreValue,
  FormScope,
  getFieldError,
  getFieldValue,
  scopeFormScope,
  getArrayUpdateKey,
  FieldArrayValidationBehaviorConfig,
} from "@rvf/core";
import { makeImplFactory } from "./implFactory";
import { ReactFormApi, makeBaseReactFormApi } from "./base";
import { ValidationBehaviorConfig } from "@rvf/core";
import { useFormScopeOrContextInternal } from "./context";

export interface FieldArrayApi<FormInputData extends Array<any>> {
  /**
   * Gets field name of the array.
   */
  name: () => string;

  /**
   * Gets the error message for the array itself, if any.
   */
  error: () => string | null;

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
      form: ReactFormApi<FormInputData[number]>,
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
  form: FormScope<FormInputData>;
  arrayFieldName: string;
  trackedState: FormStoreValue;
  validationBehavior?: FieldArrayValidationBehaviorConfig;
};

export const makeFieldArrayImpl = <FormInputData extends Array<any>>({
  form,
  arrayFieldName,
  trackedState,
  validationBehavior,
}: FieldArrayParams<FormInputData>): FieldArrayApi<FormInputData> => {
  const itemImpl = makeImplFactory(arrayFieldName, (itemFieldName) =>
    makeBaseReactFormApi({
      form: scopeFormScope(form, itemFieldName) as FormScope<
        FormInputData[number]
      >,
      prefix: itemFieldName,
      trackedState,
    }),
  );

  const length = () => {
    const val = getFieldValue(trackedState, arrayFieldName);
    if (val == null) return 0;
    if (Array.isArray(val)) return val.length;
    console.warn(
      "Tried to treat a non-array as an array. Make sure you used the correct field name and set a default value.",
    );
    return 0;
  };

  // TODO: handle validation behavior

  return {
    name: () => arrayFieldName,
    error: () => getFieldError(trackedState, arrayFieldName),
    length,
    map: (callback) => {
      getArrayUpdateKey(trackedState, arrayFieldName);
      return trackedState
        .getFieldArrayKeys(arrayFieldName)
        .map((key, index) => {
          const itemFormScope = itemImpl(String(index));
          return callback(key, itemFormScope, index);
        });
    },
    push: (value) =>
      trackedState.arrayPush(arrayFieldName, value, validationBehavior),
    pop: () => trackedState.arrayPop(arrayFieldName, validationBehavior),
    shift: () => trackedState.arrayShift(arrayFieldName, validationBehavior),
    unshift: (value) =>
      trackedState.arrayUnshift(arrayFieldName, value, validationBehavior),
    insert: (index, value) =>
      trackedState.arrayInsert(
        arrayFieldName,
        index,
        value,
        validationBehavior,
      ),
    move: (fromIndex, toIndex) =>
      trackedState.arrayMove(
        arrayFieldName,
        fromIndex,
        toIndex,
        validationBehavior,
      ),
    remove: (index) =>
      trackedState.arrayRemove(arrayFieldName, index, validationBehavior),
    swap: (fromIndex, toIndex) =>
      trackedState.arraySwap(
        arrayFieldName,
        fromIndex,
        toIndex,
        validationBehavior,
      ),
    replace: (index, value) =>
      trackedState.arrayReplace(
        arrayFieldName,
        index,
        value,
        validationBehavior,
      ),
  };
};

export type UseFieldArrayOpts = {
  validationBehavior?: FieldArrayValidationBehaviorConfig;
};
export function useFieldArray<FormInputData extends any[]>(
  form: FormScope<FormInputData>,
  { validationBehavior }?: UseFieldArrayOpts,
): FieldArrayApi<FormInputData>;
export function useFieldArray<FormInputData extends any[] = unknown[]>(
  name: string,
  opts?: UseFieldArrayOpts,
): FieldArrayApi<FormInputData>;
export function useFieldArray<FormInputData extends any[]>(
  formOrName: FormScope<FormInputData> | string,
  { validationBehavior }: UseFieldArrayOpts = {},
) {
  const scope = useFormScopeOrContextInternal(formOrName);
  const prefix = scope.__field_prefix__;
  const { useStoreState } = scope.__store__;
  const trackedState = useStoreState();

  // Accessing _something_ is required. Otherwise, it will rerender on every state update.
  // I saw this done in one of the dia-shi's codebases, too, but I can't find it now.
  trackedState.setValue;

  const base = useMemo(
    () =>
      makeFieldArrayImpl({
        form: scope as never,
        arrayFieldName: prefix,
        trackedState,
        validationBehavior,
      }),
    [prefix, scope, trackedState, validationBehavior],
  );

  return base;
}

export type FieldArrayPropsWithScope<FormInputData extends any[]> = {
  scope: FormScope<FormInputData>;
  children: (field: FieldArrayApi<FormInputData>) => React.ReactNode;
};

export type FieldArrayPropsWithName<FormInputData extends any[]> = {
  name: string;
  children: (field: FieldArrayApi<FormInputData>) => React.ReactNode;
};

export function FieldArray<FormInputData extends any[] = unknown[]>(
  props:
    | FieldArrayPropsWithName<FormInputData>
    | FieldArrayPropsWithScope<FormInputData>,
): React.ReactNode {
  const field =
    // not actually breaking rules here
    // eslint-disable-next-line react-hooks/rules-of-hooks
    "name" in props ? useFieldArray(props.name) : useFieldArray(props.scope);
  return props.children(field as FieldArrayApi<FormInputData>);
}
