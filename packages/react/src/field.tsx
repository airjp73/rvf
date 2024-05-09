import { FormStoreValue, Rvf } from "@rvf/core";
import { GetInputProps, createGetInputProps } from "./inputs/getInputProps";

export interface RvfField<FormInputData> {
  getInputProps: GetInputProps;

  value(): FormInputData;
  setValue(value: FormInputData): void;
  defaultValue(): FormInputData;

  touched(): boolean;
  setTouched(value: boolean): void;

  dirty(): boolean;
  setDirty(value: boolean): void;

  error(): string | null;
  clearError(): void;

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
    getInputProps: createGetInputProps({
      clearError: () => trackedState.setError(fieldName, null),
      validate: () => trackedState.validateField(fieldName),
    }),

    value: () => trackedState.getValue(fieldName) as FormInputData,
    setValue: (value) => trackedState.setValue(fieldName, value),
    defaultValue: () =>
      trackedState.getDefaultValue(fieldName) as FormInputData,
    touched: () => trackedState.getTouched(fieldName),
    setTouched: (value) => trackedState.setTouched(fieldName, value),
    dirty: () => trackedState.getDirty(fieldName),
    setDirty: (value) => trackedState.setDirty(fieldName, value),
    error: () => trackedState.getError(fieldName),
    clearError: () => trackedState.setError(fieldName, null),
    reset: () => trackedState.resetField(fieldName),
  };
};
