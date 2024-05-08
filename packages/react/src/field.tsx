import { FormStoreValue, Rvf } from "@rvf/core";

export interface RvfField<FormInputData> {
  helpers: RvfFieldHelpers<FormInputData>;
}

export interface RvfFieldHelpers<FormInputData> {
  value(): FormInputData;
  setValue(value: FormInputData): void;
  defaultValue(): FormInputData;

  touched(): boolean;
  setTouched(value: boolean): void;

  dirty(): boolean;
  setDirty(value: boolean): void;

  error(): string | null;
  setError(value: string | null): void;

  reset(): void;
}

export type FieldImplParams<FormInputData> = {
  form: Rvf<FormInputData>;
  fieldName: string;
  trackedState: FormStoreValue;
};

export const makeFieldImpl = <FormInputData,>({
  form,
  fieldName,
  trackedState,
}: FieldImplParams<FormInputData>): RvfField<FormInputData> => {
  return {
    helpers: {
      value: () => trackedState.getValue(fieldName) as FormInputData,
      setValue: (value) => trackedState.setValue(fieldName, value),
      defaultValue: () =>
        trackedState.getDefaultValue(fieldName) as FormInputData,
      touched: () => trackedState.getTouched(fieldName),
      setTouched: (value) => trackedState.setTouched(fieldName, value),
      dirty: () => trackedState.getDirty(fieldName),
      setDirty: (value) => trackedState.setDirty(fieldName, value),
      error: () => trackedState.getError(fieldName),
      setError: (value) => trackedState.setError(fieldName, value),
      reset: () => trackedState.resetField(fieldName),
    },
  };
};
