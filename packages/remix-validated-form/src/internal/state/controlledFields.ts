import { useCallback, useEffect } from "react";
import { InternalFormContextValue } from "../formContext";
import { useFieldDefaultValue } from "../hooks";
import { useControlledFieldStore, useFormStore } from "./storeHooks";
import { InternalFormId } from "./types";

export const useControlledFieldValue = (
  context: InternalFormContextValue,
  field: string
) => {
  const value = useControlledFieldStore(
    context.formId,
    (state) => state.fields[field]?.value
  );

  const isFormHydrated = useFormStore(
    context.formId,
    (state) => state.isHydrated
  );
  const defaultValue = useFieldDefaultValue(field, context);

  const isFieldHydrated = useControlledFieldStore(
    context.formId,
    (state) => state.fields[field]?.hydrated ?? false
  );
  const hydrateWithDefault = useControlledFieldStore(
    context.formId,
    (state) => state.hydrateWithDefault
  );

  useEffect(() => {
    if (isFormHydrated && !isFieldHydrated) {
      hydrateWithDefault(field, defaultValue);
    }
  }, [
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
    context.formId,
    (state) => state.fields[field]?.resolveValueUpdate
  );
  useEffect(() => {
    resolveUpdate?.();
  }, [resolveUpdate]);

  const register = useControlledFieldStore(
    context.formId,
    (state) => state.register
  );
  const unregister = useControlledFieldStore(
    context.formId,
    (state) => state.unregister
  );
  useEffect(() => {
    register(field);
    return () => unregister(field);
  }, [context.formId, field, register, unregister]);

  const setControlledFieldValue = useControlledFieldStore(
    context.formId,
    (state) => state.setValue
  );
  const setValue = useCallback(
    (value: unknown) => setControlledFieldValue(field, value),
    [field, setControlledFieldValue]
  );

  const value = useControlledFieldValue(context, field);

  return [value, setValue] as const;
};

export const useUpdateControllableValue = (formId: InternalFormId) => {
  return useControlledFieldStore(formId, (state) => state.setValue);
};

export const useAwaitValue = (formId: InternalFormId) => {
  return useControlledFieldStore(formId, (state) => state.awaitValueUpdate);
};
