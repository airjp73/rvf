import { RefCallback } from "react";
import {
  FormStoreValue,
  Rvf,
  ValidationBehaviorConfig,
  getFieldDefaultValue,
  getFieldDirty,
  getFieldError,
  getFieldTouched,
  getFieldValue,
} from "@rvf/core";
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
  validationBehavior?: ValidationBehaviorConfig;
};

export const makeFieldImpl = <FormInputData,>({
  form,
  fieldName,
  trackedState,
  validationBehavior,
}: FieldImplParams<FormInputData>): RvfField<FormInputData> => {
  const onChange = (value: unknown) =>
    trackedState.onFieldChange(fieldName, value, validationBehavior);

  const onBlur = () => trackedState.onFieldBlur(fieldName, validationBehavior);

  return {
    getInputProps: createGetInputProps({
      onChange,
      onBlur,
      defaultValue: getFieldDefaultValue(trackedState, fieldName),
      name: fieldName,
      ref: (ref) => form.__store__.transientFieldRefs.setRef(fieldName, ref),
      getCurrentValue: () =>
        getFieldValue(form.__store__.store.getState(), fieldName),
    }),

    getControlProps: (props = {}) => ({
      onChange: (value) => {
        onChange(value);
        props.onChange?.(value);
      },
      onBlur: () => {
        onBlur();
        props.onBlur?.();
      },
      value: getFieldValue(trackedState, fieldName) as never,
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

    value: () => getFieldValue(trackedState, fieldName) as FormInputData,
    setValue: (value) => trackedState.setValue(fieldName, value),
    defaultValue: () =>
      getFieldDefaultValue(trackedState, fieldName) as FormInputData,
    touched: () => getFieldTouched(trackedState, fieldName),
    setTouched: (value) => trackedState.setTouched(fieldName, value),
    dirty: () => getFieldDirty(trackedState, fieldName),
    setDirty: (value) => trackedState.setDirty(fieldName, value),
    error: () => getFieldError(trackedState, fieldName),
    clearError: () => trackedState.setError(fieldName, null),
    reset: () => trackedState.resetField(fieldName),
  };
};
