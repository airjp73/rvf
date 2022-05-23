import { useCallback, useEffect } from "react";
import { InternalFormContextValue } from "../formContext";
import { useFieldDefaultValue } from "../hooks";
import { useFormStore } from "./storeHooks";
import { InternalFormId } from "./types";

export const useControlledFieldValue = (
  context: InternalFormContextValue,
  field: string
) => {
  const value = useFormStore(context.formId, (state) =>
    state.controlledFields.getValue(field)
  );
  const isFormHydrated = useFormStore(
    context.formId,
    (state) => state.isHydrated
  );
  const defaultValue = useFieldDefaultValue(field, context);

  return isFormHydrated ? value : defaultValue;
};

export const useControllableValue = (
  context: InternalFormContextValue,
  field: string
) => {
  const resolveUpdate = useFormStore(
    context.formId,
    (state) => state.controlledFields.valueUpdateResolvers[field]
  );
  useEffect(() => {
    resolveUpdate?.();
  }, [resolveUpdate]);

  const register = useFormStore(
    context.formId,
    (state) => state.controlledFields.register
  );
  const unregister = useFormStore(
    context.formId,
    (state) => state.controlledFields.unregister
  );
  useEffect(() => {
    register(field);
    return () => unregister(field);
  }, [context.formId, field, register, unregister]);

  const setControlledFieldValue = useFormStore(
    context.formId,
    (state) => state.controlledFields.setValue
  );
  const setValue = useCallback(
    (value: unknown) => setControlledFieldValue(field, value),
    [field, setControlledFieldValue]
  );

  const getControlledFieldValue = useFormStore(
    context.formId,
    (state) => state.controlledFields.getValue
  );
  const getValue = useCallback(
    () => getControlledFieldValue(field),
    [field, getControlledFieldValue]
  );

  const value = useControlledFieldValue(context, field);

  return [value, setValue, getValue] as const;
};

export const useUpdateControllableValue = (formId: InternalFormId) => {
  const setValue = useFormStore(
    formId,
    (state) => state.controlledFields.setValue
  );
  return useCallback(
    (field: string, value: unknown) => setValue(field, value),
    [setValue]
  );
};

export const useAwaitValue = (formId: InternalFormId) => {
  const awaitValue = useFormStore(
    formId,
    (state) => state.controlledFields.awaitValueUpdate
  );
  return useCallback((field: string) => awaitValue(field), [awaitValue]);
};
