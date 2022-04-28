import { useCallback, useEffect } from "react";
import { InternalFormContextValue } from "../formContext";
import { useFieldDefaultValue } from "../hooks";
import { controlledFieldStore } from "./controlledFieldStore";
import { formStore } from "./createFormStore";
import { InternalFormId } from "./storeFamily";

export const useControlledFieldValue = (
  context: InternalFormContextValue,
  field: string
) => {
  const useValueStore = controlledFieldStore(context.formId);
  const value = useValueStore((state) => state.fields[field].value);

  const useFormStore = formStore(context.formId);
  const isFormHydrated = useFormStore((state) => state.isHydrated);
  const defaultValue = useFieldDefaultValue(field, context);

  const isFieldHydrated = useValueStore(
    (state) => state.fields[field].hydrated
  );
  const hydrateWithDefault = useValueStore((state) => state.hydrateWithDefault);

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
  const useValueStore = controlledFieldStore(context.formId);

  const resolveUpdate = useValueStore(
    (state) => state.fields[field].resolveValueUpdate
  );
  useEffect(() => {
    resolveUpdate?.();
  }, [resolveUpdate]);

  const register = useValueStore((state) => state.register);
  const unregister = useValueStore((state) => state.unregister);
  useEffect(() => {
    register(field);
    return () => unregister(field);
  }, [context.formId, field, register, unregister]);

  const setControlledFieldValue = useValueStore((state) => state.setValue);
  const setValue = useCallback(
    (value: unknown) => setControlledFieldValue(field, value),
    [field, setControlledFieldValue]
  );

  const value = useControlledFieldValue(context, field);

  return [value, setValue] as const;
};

export const useUpdateControllableValue = (formId: InternalFormId) => {
  const useValueStore = controlledFieldStore(formId);
  return useValueStore((state) => state.setValue);
};

export const useAwaitValue = (formId: InternalFormId) => {
  const useValueStore = controlledFieldStore(formId);
  return useValueStore((state) => state.awaitValueUpdate);
};
