import { useMemo } from "react";
import { createContext } from "react";
import { useCallback } from "react";
import invariant from "tiny-invariant";
import { InternalFormContextValue } from "../formContext";
import { useInternalFormContext } from "../hooks";
import { useControllableValue } from "./controlledFields";

const useFieldArray = (context: InternalFormContextValue, field: string) => {
  const [value, setValue, get] = useControllableValue(context, field);

  const getValue = useCallback(() => {
    const value = get() ?? [];
    invariant(
      Array.isArray(value),
      `FieldArray: defaultValue value for ${field} must be an array, null, or undefined`
    );
    return value;
  }, [field, get]);

  const push = useCallback(
    (item: any) => {
      setValue([...getValue(), item]);
    },
    [getValue, setValue]
  );

  const swap = useCallback(
    (indexA: number, indexB: number) => {
      const prev = getValue();
      const itemA = prev[indexA];
      const itemB = prev[indexB];
      const next = [...prev];
      next.splice(indexA, 1, itemB);
      next.splice(indexB, 1, itemA);
      setValue(next);
    },
    [getValue, setValue]
  );

  const move = useCallback(
    (from: number, to: number) => {
      const prev = getValue();
      const next = [...prev];
      const item = prev[from];
      next.splice(from, 1);
      next.splice(to, 0, item);
      setValue(next);
    },
    [getValue, setValue]
  );

  const insert = useCallback(
    (index: number, value: any) => {
      const prev = getValue();
      const next = [...prev];
      next.splice(index, 0, value);
      setValue(next);
    },
    [getValue, setValue]
  );

  const unshift = useCallback(() => {
    const prev = getValue();
    const next = [...prev];
    next.unshift();
    setValue(next);
  }, [getValue, setValue]);

  const remove = useCallback(
    (index: number) => {
      const next = [...getValue()];
      next.splice(index, 1);
      setValue(next);
    },
    [getValue, setValue]
  );

  const pop = useCallback(() => {
    const next = [...getValue()];
    next.pop();
    setValue(next);
  }, [getValue, setValue]);

  const replace = useCallback(
    (index: number, value: any) => {
      const next = [...getValue()];
      next.splice(index, 1, value);
      setValue(next);
    },
    [getValue, setValue]
  );

  const helpers = useMemo(
    () => ({
      push,
      swap,
      move,
      insert,
      unshift,
      remove,
      pop,
      replace,
    }),
    [insert, move, pop, push, remove, replace, swap, unshift]
  );

  return [value, helpers] as const;
};

export const FieldArrayContext = createContext<{
  defaultValues: any[];
  name: string;
} | null>(null);

export type FieldArrayHelpers = {
  push: (item: any) => void;
  swap: (indexA: number, indexB: number) => void;
  move: (from: number, to: number) => void;
  insert: (index: number, value: any) => void;
  unshift: () => void;
  remove: (index: number) => void;
  pop: () => void;
  replace: (index: number, value: any) => void;
};

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
  const [value, helpers] = useFieldArray(context, name);

  invariant(
    value === undefined || value === null || Array.isArray(value),
    `FieldArray: defaultValue value for ${name} must be an array, null, or undefined`
  );

  const contextValue = useMemo(
    () => ({ defaultValues: value ?? [], name }),
    [name, value]
  );

  return (
    <FieldArrayContext.Provider value={contextValue}>
      {children(contextValue.defaultValues, helpers)}
    </FieldArrayContext.Provider>
  );
};
