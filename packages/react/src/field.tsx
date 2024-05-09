import { RefCallback } from "react";
import { FormStoreValue, Rvf } from "@rvf/core";
import { GetInputProps, createGetInputProps } from "./inputs/getInputProps";

export interface RvfField<FormInputData> {
  getInputProps: GetInputProps;
  getControlProps: (props?: {
    onChange?: (value: FormInputData) => void;
    onBlur?: () => void;
  }) => {
    onChange: (value: FormInputData) => void;
    onBlur: () => void;
    value: FormInputData;
    ref: RefCallback<HTMLInputElement>;
  };

  refs: {
    controlled: RefCallback<HTMLInputElement>;
    transient: RefCallback<HTMLInputElement>;
  };

  onChange: (value: FormInputData) => void;
  onBlur: () => void;

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
  const onChange = (value: unknown) =>
    trackedState.onFieldChange(fieldName, value);

  const onBlur = () => trackedState.onFieldBlur(fieldName);

  return {
    getInputProps: createGetInputProps({
      onChange,
      onBlur,
      defaultValue: trackedState.getDefaultValue(fieldName),
      name: fieldName,
      ref: (ref) => form.__store__.transientFieldRefs.setRef(fieldName, ref),
    }),

    getControlProps: ({ onChange, onBlur } = {}) => ({
      onChange: (value) => {
        trackedState.onFieldChange(fieldName, value);
        onChange?.(value);
      },
      onBlur: () => {
        trackedState.onFieldBlur(fieldName);
        onBlur?.();
      },
      value: trackedState.getValue(fieldName) as never,
      ref: (ref) => form.__store__.controlledFieldRefs.setRef(fieldName, ref),
    }),

    refs: {
      transient: (ref) =>
        form.__store__.transientFieldRefs.setRef(fieldName, ref),
      controlled: (ref) =>
        form.__store__.controlledFieldRefs.setRef(fieldName, ref),
    },

    onChange,
    onBlur,

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
