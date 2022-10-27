import React, { useMemo } from "react";
import { useCallback } from "react";
import invariant from "tiny-invariant";
import { InternalFormContextValue } from "../formContext";
import {
  useFieldDefaultValue,
  useFieldError,
  useInternalFormContext,
  useInternalHasBeenSubmitted,
  useValidateField,
} from "../hooks";
import { useRegisterControlledField } from "./controlledFields";
import { useFormStore } from "./storeHooks";

export type FieldArrayValidationBehavior = "onChange" | "onSubmit";

export type FieldArrayValidationBehaviorOptions = {
  initial: FieldArrayValidationBehavior;
  whenSubmitted: FieldArrayValidationBehavior;
};

const useInternalFieldArray = (
  context: InternalFormContextValue,
  field: string,
  validationBehavior?: Partial<FieldArrayValidationBehaviorOptions>
) => {
  const value = useFieldDefaultValue(field, context);
  useRegisterControlledField(context, field);
  const hasBeenSubmitted = useInternalHasBeenSubmitted(context.formId);
  const validateField = useValidateField(context.formId);
  const error = useFieldError(field, context);

  const resolvedValidationBehavior: FieldArrayValidationBehaviorOptions = {
    initial: "onSubmit",
    whenSubmitted: "onChange",
    ...validationBehavior,
  };

  const behavior = hasBeenSubmitted
    ? resolvedValidationBehavior.whenSubmitted
    : resolvedValidationBehavior.initial;

  const maybeValidate = useCallback(() => {
    if (behavior === "onChange") {
      validateField(field);
    }
  }, [behavior, field, validateField]);

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
        maybeValidate();
      },
      swap: (indexA: number, indexB: number) => {
        arr.swap(field, indexA, indexB);
        maybeValidate();
      },
      move: (from: number, to: number) => {
        arr.move(field, from, to);
        maybeValidate();
      },
      insert: (index: number, value: any) => {
        arr.insert(field, index, value);
        maybeValidate();
      },
      unshift: (value: any) => {
        arr.unshift(field, value);
        maybeValidate();
      },
      remove: (index: number) => {
        arr.remove(field, index);
        maybeValidate();
      },
      pop: () => {
        arr.pop(field);
        maybeValidate();
      },
      replace: (index: number, value: any) => {
        arr.replace(field, index, value);
        maybeValidate();
      },
    }),
    [arr, field, maybeValidate]
  );

  const arrayValue = useMemo(() => value ?? [], [value]);

  return [arrayValue, helpers, error] as const;
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

export type UseFieldArrayOptions = {
  formId?: string;
  validationBehavior?: Partial<FieldArrayValidationBehaviorOptions>;
};

export function useFieldArray<Item = any>(
  name: string,
  { formId, validationBehavior }: UseFieldArrayOptions = {}
) {
  const context = useInternalFormContext(formId, "FieldArray");

  return useInternalFieldArray(context, name, validationBehavior) as [
    itemDefaults: Item[],
    helpers: FieldArrayHelpers,
    error: string | undefined
  ];
}

export type FieldArrayProps = {
  name: string;
  children: (
    itemDefaults: any[],
    helpers: FieldArrayHelpers,
    error: string | undefined
  ) => React.ReactNode;
  formId?: string;
  validationBehavior?: FieldArrayValidationBehaviorOptions;
};

export const FieldArray = ({
  name,
  children,
  formId,
  validationBehavior,
}: FieldArrayProps) => {
  const context = useInternalFormContext(formId, "FieldArray");
  const [value, helpers, error] = useInternalFieldArray(
    context,
    name,
    validationBehavior
  );
  return <>{children(value, helpers, error)}</>;
};
