import { atom, PrimitiveAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import omit from "lodash/omit";
import { useCallback, useEffect } from "react";
import {
  useFieldDefaultValue,
  useFormAtomValue,
  useFormAtom,
  useFormUpdateAtom,
} from "../hooks";
import { isHydratedAtom } from "../state";
import {
  fieldAtomFamily,
  FieldAtomKey,
  formAtomFamily,
  InternalFormId,
} from "./atomUtils";

export const controlledFieldsAtom = formAtomFamily<
  Record<string, PrimitiveAtom<unknown>>
>({});
const refCountAtom = fieldAtomFamily(() => atom(0));
const fieldValueAtom = fieldAtomFamily(() => atom<unknown>(undefined));
const fieldValueHydratedAtom = fieldAtomFamily(() => atom(false));

export const valueUpdatePromiseAtom = fieldAtomFamily(() =>
  atom<Promise<void> | undefined>(undefined)
);
export const resolveValueUpdateAtom = fieldAtomFamily(() =>
  atom<(() => void) | undefined>(undefined)
);

const registerAtom = atom(null, (get, set, { formId, field }: FieldAtomKey) => {
  set(refCountAtom({ formId, field }), (prev) => prev + 1);
  const newRefCount = get(refCountAtom({ formId, field }));
  // We don't set hydrated here because it gets set when we know
  // we have the right default values
  if (newRefCount === 1) {
    set(controlledFieldsAtom(formId), (prev) => ({
      ...prev,
      [field]: fieldValueAtom({ formId, field }),
    }));
  }
});

const unregisterAtom = atom(
  null,
  (get, set, { formId, field }: FieldAtomKey) => {
    set(refCountAtom({ formId, field }), (prev) => prev - 1);
    const newRefCount = get(refCountAtom({ formId, field }));
    if (newRefCount === 0) {
      set(controlledFieldsAtom(formId), (prev) => omit(prev, field));
      fieldValueAtom.remove({ formId, field });
      resolveValueUpdateAtom.remove({ formId, field });
      fieldValueHydratedAtom.remove({ formId, field });
    }
  }
);

export const setControlledFieldValueAtom = atom(
  null,
  (
    _get,
    set,
    {
      formId,
      field,
      value,
    }: { formId: InternalFormId; field: string; value: unknown }
  ) => {
    set(fieldValueAtom({ formId, field }), value);
    const resolveAtom = resolveValueUpdateAtom({ formId, field });
    const promiseAtom = valueUpdatePromiseAtom({ formId, field });

    const promise = new Promise<void>((resolve) =>
      set(resolveAtom, () => {
        resolve();
        set(resolveAtom, undefined);
        set(promiseAtom, undefined);
      })
    );
    set(promiseAtom, promise);
  }
);

export const useControlledFieldValue = (
  formId: InternalFormId,
  field: string
) => {
  const fieldAtom = fieldValueAtom({ formId, field });
  const [value, setValue] = useFormAtom(fieldAtom);

  const defaultValue = useFieldDefaultValue(field, { formId });
  const isHydrated = useFormAtomValue(isHydratedAtom(formId));
  const [isFieldHydrated, setIsFieldHydrated] = useFormAtom(
    fieldValueHydratedAtom({ formId, field })
  );

  useEffect(() => {
    if (isHydrated && !isFieldHydrated) {
      setValue(defaultValue);
      setIsFieldHydrated(true);
    }
  }, [
    defaultValue,
    field,
    formId,
    isFieldHydrated,
    isHydrated,
    setIsFieldHydrated,
    setValue,
  ]);

  return isFieldHydrated ? value : defaultValue;
};

export const useControllableValue = (formId: InternalFormId, field: string) => {
  const resolveUpdate = useFormAtomValue(
    resolveValueUpdateAtom({ formId, field })
  );
  useEffect(() => {
    resolveUpdate?.();
  }, [resolveUpdate]);

  const register = useFormUpdateAtom(registerAtom);
  const unregister = useFormUpdateAtom(unregisterAtom);
  useEffect(() => {
    register({ formId, field });
    return () => unregister({ formId, field });
  }, [field, formId, register, unregister]);

  const setControlledFieldValue = useFormUpdateAtom(
    setControlledFieldValueAtom
  );
  const setValue = useCallback(
    (value: unknown) => setControlledFieldValue({ formId, field, value }),
    [field, formId, setControlledFieldValue]
  );

  const value = useControlledFieldValue(formId, field);

  return [value, setValue] as const;
};

export const useAwaitValue = (formId: InternalFormId) => {
  return useAtomCallback(async (get, _set, field: string) => {
    await get(valueUpdatePromiseAtom({ formId, field }));
  });
};
