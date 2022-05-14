import { useCallback, useEffect } from "react";
import { InternalFormContextValue } from "../formContext";
import { useFieldDefaultValue } from "../hooks";
import { useControlledFieldStore } from "./controlledFieldStore";
import { useFormStore } from "./storeHooks";
import { InternalFormId } from "./types";

export const useControlledFieldValue = (
  context: InternalFormContextValue,
  field: string
) => {
  const value = useControlledFieldStore(
    (state) => state.getField(context.formId, field)?.value
  );

  const isFormHydrated = useFormStore(
    context.formId,
    (state) => state.isHydrated
  );
  const defaultValue = useFieldDefaultValue(field, context);

  const isFieldHydrated = useControlledFieldStore(
    (state) => state.getField(context.formId, field)?.hydrated ?? false
  );
  const hydrateWithDefault = useControlledFieldStore(
    (state) => state.hydrateWithDefault
  );

  useEffect(() => {
    if (isFormHydrated && !isFieldHydrated) {
      hydrateWithDefault(context.formId, field, defaultValue);
    }
  }, [
    context.formId,
    defaultValue,
    field,
    hydrateWithDefault,
    isFieldHydrated,
    isFormHydrated,
  ]);

  return isFieldHydrated ? value : defaultValue;
};

export const useControllableValue = (
  context: InternalFormContextValue,
  field: string
) => {
  const resolveUpdate = useControlledFieldStore(
    (state) => state.getField(context.formId, field)?.resolveValueUpdate
  );
  useEffect(() => {
    resolveUpdate?.();
  }, [resolveUpdate]);

  const register = useControlledFieldStore((state) => state.register);
  const unregister = useControlledFieldStore((state) => state.unregister);
  useEffect(() => {
    register(context.formId, field);
    return () => unregister(context.formId, field);
  }, [context.formId, field, register, unregister]);

  const setControlledFieldValue = useControlledFieldStore(
    (state) => state.setValue
  );
  const setValue = useCallback(
    (value: unknown) => setControlledFieldValue(context.formId, field, value),
    [context.formId, field, setControlledFieldValue]
  );

  const value = useControlledFieldValue(context, field);

  return [value, setValue] as const;
};

export const useUpdateControllableValue = (formId: InternalFormId) => {
  const setValue = useControlledFieldStore((state) => state.setValue);
  return useCallback(
    (field: string, value: unknown) => setValue(formId, field, value),
    [formId, setValue]
  );
};

export const useAwaitValue = (formId: InternalFormId) => {
  const awaitValue = useControlledFieldStore((state) => state.awaitValueUpdate);
  return useCallback(
    (field: string) => awaitValue(formId, field),
    [awaitValue, formId]
  );
};
