import { ReactNode, RefCallback, useMemo } from "react";
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
import { FormApi, makeBaseFormApi, useHydrated } from "./base";
import { useFormScopeOrContextInternal } from "./context";
import { createControlledRef } from "./refs";

export interface FieldArrayApi<FormInputData extends Array<any>> {
  /**
   * Normally, when a user submits a form and it contains validation error,
   * the first invalid element in the form will be focused.
   * Pass this ref to a focusable element to simulate this behavior when there are array-level errors
   * for this field array.
   */
  errorFocusElement: RefCallback<HTMLElement>;

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
   * Returns an array of the keys used when mapping over the array.
   * The identity of the array is stable and only updates (and causes a rerender)
   * when the number of items in the array changes, or the array is reset.
   * This is usually not necesary, but can be useful for some advanced scenarios.
   */
  keys: () => string[];

  /**
   * Maps over and renders the array items.
   * Using the `form` parameter passed to the callback will isolate rerenders to each individual item.
   * Changes to the length of the array will also be isoated to this `map` call.
   */
  map: <Value>(
    callback: (
      key: string,
      form: FormApi<FormInputData[number]>,
      index: number,
    ) => Value,
  ) => Value[];

  /**
   * Adds an item to the array. Just like `Array.push`.
   */
  push: (value: FormInputData[number]) => Promise<void>;

  /**
   * Pops the last item in the array. Similar to `Array.pop`.
   */
  pop: () => Promise<void>;

  /**
   * Removes the first item in the array. Similar to `Array.shift`.
   */
  shift: () => Promise<void>;

  /**
   * Inserts an item at the start of the array. Just like `Array.unshift`.
   */
  unshift: (value: FormInputData[number]) => Promise<void>;

  /**
   * Inserts an item at a specific index in the array.
   */
  insert: (index: number, value: FormInputData[number]) => Promise<void>;

  /**
   * Moves an item from `fromIndex` to `toIndex` in the array.
   * This process happens by removing the item at `fromIndex` and inserting it at `toIndex`.
   * Keep this in mind if your `toIndex` is after the `fromIndex`.
   */
  move: (fromIndex: number, toIndex: number) => Promise<void>;

  /**
   * Removes an item from the array.
   */
  remove: (index: number) => Promise<void>;

  /**
   * Swaps the items at `fromIndex` and `toIndex` in the array.
   */
  swap: (fromIndex: number, toIndex: number) => Promise<void>;

  /**
   * Replaces an item in the array.
   * The new value will be treated as a new field, which will reset any `touched`, `dirty`, or `validationErrors` for the item.
   * It will also generate a new key for the item.
   */
  replace: (index: number, value: FormInputData[number]) => Promise<void>;
}

export type FieldArrayParams<FormInputData> = {
  form: FormScope<FormInputData>;
  trackedState: FormStoreValue;
  validationBehavior?: FieldArrayValidationBehaviorConfig;
};

export const makeFieldArrayImpl = <FormInputData extends Array<any>>({
  form,
  trackedState,
  validationBehavior,
  isHydrated,
}: FieldArrayParams<FormInputData> & {
  isHydrated: boolean;
}): FieldArrayApi<FormInputData> => {
  const arrayFieldName = form.__field_prefix__;
  const itemImpl = makeImplFactory(arrayFieldName, (itemFieldName) =>
    makeBaseFormApi({
      form: scopeFormScope(form, itemFieldName) as FormScope<
        FormInputData[number]
      >,
      trackedState,
      isHydrated,
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
    errorFocusElement: createControlledRef(arrayFieldName, form),
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
    keys: () => {
      getArrayUpdateKey(trackedState, arrayFieldName);
      return trackedState.getFieldArrayKeys(arrayFieldName);
    },
    push: (value) => {
      trackedState.arrayPush(arrayFieldName, value, validationBehavior);
      return form.__store__.resolvers.await();
    },
    pop: () => {
      trackedState.arrayPop(arrayFieldName, validationBehavior);
      return form.__store__.resolvers.await();
    },
    shift: () => {
      trackedState.arrayShift(arrayFieldName, validationBehavior);
      return form.__store__.resolvers.await();
    },
    unshift: (value) => {
      trackedState.arrayUnshift(arrayFieldName, value, validationBehavior);
      return form.__store__.resolvers.await();
    },
    insert: (index, value) => {
      trackedState.arrayInsert(
        arrayFieldName,
        index,
        value,
        validationBehavior,
      );
      return form.__store__.resolvers.await();
    },
    move: (fromIndex, toIndex) => {
      trackedState.arrayMove(
        arrayFieldName,
        fromIndex,
        toIndex,
        validationBehavior,
      );
      return form.__store__.resolvers.await();
    },
    remove: (index) => {
      trackedState.arrayRemove(arrayFieldName, index, validationBehavior);
      return form.__store__.resolvers.await();
    },
    swap: (fromIndex, toIndex) => {
      trackedState.arraySwap(
        arrayFieldName,
        fromIndex,
        toIndex,
        validationBehavior,
      );
      return form.__store__.resolvers.await();
    },
    replace: (index, value) => {
      trackedState.arrayReplace(
        arrayFieldName,
        index,
        value,
        validationBehavior,
      );
      return form.__store__.resolvers.await();
    },
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
  const { useStoreState } = scope.__store__;
  const trackedState = useStoreState();
  const isHydrated = useHydrated();

  // Accessing _something_ is required. Otherwise, it will rerender on every state update.
  // I saw this done in one of the dia-shi's codebases, too, but I can't find it now.
  trackedState.setValue;

  const base = useMemo(
    () =>
      makeFieldArrayImpl({
        form: scope as never,
        trackedState,
        validationBehavior,
        isHydrated,
      }),
    [scope, trackedState, validationBehavior, isHydrated],
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
