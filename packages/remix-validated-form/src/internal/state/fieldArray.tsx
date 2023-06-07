import { nanoid } from "nanoid";
import React, { useMemo, useState } from "react";
import { useCallback } from "react";
import invariant from "tiny-invariant";
import { InternalFormContextValue } from "../formContext";
import {
  useFieldDefaultValue,
  useFieldError,
  useInternalFormContext,
  useInternalHasBeenSubmitted,
  useSmartValidate,
} from "../hooks";
import * as arrayUtil from "./arrayUtil";
import { useRegisterControlledField } from "./controlledFields";
import { useFormStore } from "./storeHooks";

export type FieldArrayValidationBehavior = "onChange" | "onSubmit";

export type FieldArrayValidationBehaviorOptions = {
  initial: FieldArrayValidationBehavior;
  whenSubmitted: FieldArrayValidationBehavior;
};

export type FieldArrayItem<T> = {
  /**
   * The default value of the item.
   * This does not update as the field is changed by the user.
   */
  defaultValue: T;
  /**
   * A unique key for the item.
   * Use this as the key prop when rendering the item.
   */
  key: string;
};

const useInternalFieldArray = (
  context: InternalFormContextValue,
  field: string,
  validationBehavior?: Partial<FieldArrayValidationBehaviorOptions>
) => {
  const value = useFieldDefaultValue(field, context);
  useRegisterControlledField(context, field);
  const hasBeenSubmitted = useInternalHasBeenSubmitted(context.formId);
  const validateField = useSmartValidate(context.formId);
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
      validateField({ alwaysIncludeErrorsFromFields: [field] });
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

  const arrayValue = useMemo(() => value ?? [], [value]);
  const [keys, setKeys] = useState<string[]>(() =>
    arrayValue.map(() => nanoid())
  );

  const helpers = useMemo(
    () => ({
      push: (item: any) => {
        arr.push(field, item);
        setKeys((keys) => {
          const newKeys = arrayUtil.sparseCopy(keys);
          newKeys.push(nanoid());
          return newKeys;
        });
        maybeValidate();
      },
      swap: (indexA: number, indexB: number) => {
        arr.swap(field, indexA, indexB);
        setKeys((keys) => {
          const newKeys = arrayUtil.sparseCopy(keys);
          arrayUtil.swap(newKeys, indexA, indexB);
          return newKeys;
        });
        maybeValidate();
      },
      move: (from: number, to: number) => {
        arr.move(field, from, to);
        setKeys((keys) => {
          const newKeys = arrayUtil.sparseCopy(keys);
          arrayUtil.move(newKeys, from, to);
          return newKeys;
        });
        maybeValidate();
      },
      insert: (index: number, value: any) => {
        arr.insert(field, index, value);
        setKeys((keys) => {
          const newKeys = arrayUtil.sparseCopy(keys);
          arrayUtil.insert(newKeys, index, nanoid());
          return newKeys;
        });
        maybeValidate();
      },
      unshift: (value: any) => {
        arr.unshift(field, value);
        setKeys((keys) => {
          const newKeys = arrayUtil.sparseCopy(keys);
          newKeys.unshift();
          return newKeys;
        });
        maybeValidate();
      },
      remove: (index: number) => {
        arr.remove(field, index);
        setKeys((keys) => {
          const newKeys = arrayUtil.sparseCopy(keys);
          arrayUtil.remove(newKeys, index);
          return newKeys;
        });
        maybeValidate();
      },
      pop: () => {
        arr.pop(field);
        setKeys((keys) => {
          const newKeys = arrayUtil.sparseCopy(keys);
          newKeys.pop();
          return newKeys;
        });
        maybeValidate();
      },
      replace: (index: number, value: any) => {
        arr.replace(field, index, value);
        setKeys((keys) => {
          const newKeys = arrayUtil.sparseCopy(keys);
          arrayUtil.replace(newKeys, index, nanoid());
          return newKeys;
        });
        maybeValidate();
      },
    }),
    [arr, field, maybeValidate]
  );

  const valueWithKeys = useMemo(() => {
    const result: { defaultValue: any; key: string }[] = [];
    result.forEach((item, index) => {
      result[index] = {
        key: keys[index],
        defaultValue: arrayValue[index],
      };
    });
    return result;
  }, [arrayValue, keys]);

  return [valueWithKeys, helpers, error] as const;
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
    items: FieldArrayItem<Item>[],
    helpers: FieldArrayHelpers,
    error: string | undefined
  ];
}

export type FieldArrayProps = {
  name: string;
  children: (
    items: FieldArrayItem<any>[],
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
