import React, { useMemo } from "react";
import invariant from "tiny-invariant";
import { InternalFormContextValue } from "../formContext";
import { useFieldDefaultValue, useInternalFormContext } from "../hooks";
import { useRegisterControlledField } from "./controlledFields";
import { useFormStore } from "./storeHooks";

const useInternalFieldArray = (
  context: InternalFormContextValue,
  field: string
) => {
  const value = useFieldDefaultValue(field, context);
  useRegisterControlledField(context, field);

  invariant(
    value === undefined || value === null || Array.isArray(value),
    `FieldArray: defaultValue value for ${field} must be an array, null, or undefined`
  );

  const arr = useFormStore(
    context.formId,
    (state) => state.controlledFields.array
  );

  const helpers = useMemo(
    () => ({
      push: (item: any) => {
        arr.push(field, item);
      },
      swap: (indexA: number, indexB: number) => {
        arr.swap(field, indexA, indexB);
      },
      move: (from: number, to: number) => {
        arr.move(field, from, to);
      },
      insert: (index: number, value: any) => {
        arr.insert(field, index, value);
      },
      unshift: (value: any) => {
        arr.unshift(field, value);
      },
      remove: (index: number) => {
        arr.remove(field, index);
      },
      pop: () => {
        arr.pop(field);
      },
      replace: (index: number, value: any) => {
        arr.replace(field, index, value);
      },
    }),
    [arr, field]
  );

  const arrayValue = useMemo(() => value ?? [], [value]);

  return [arrayValue, helpers] as const;
};

export type FieldArrayHelpers<Item = any> = {
  push: (item: Item) => void;
  swap: (indexA: number, indexB: number) => void;
  move: (from: number, to: number) => void;
  insert: (index: number, value: Item) => void;
  unshift: (value: Item) => void;
  remove: (index: number) => void;
  pop: () => void;
  replace: (index: number, value: Item) => void;
};

export function useFieldArray<Item = any>(name: string, formId?: string) {
  const context = useInternalFormContext(formId, "FieldArray");
  return useInternalFieldArray(context, name) as [
    itemDefaults: Item[],
    helpers: FieldArrayHelpers
  ];
}

export type FieldArrayProps = {
  name: string;
  children: (
    itemDefaults: any[],
    helpers: FieldArrayHelpers
  ) => React.ReactNode;
  formId?: string;
};

export const FieldArray = ({ name, children, formId }: FieldArrayProps) => {
  const context = useInternalFormContext(formId, "FieldArray");
  const [value, helpers] = useInternalFieldArray(context, name);
  return children(value, helpers);
};
