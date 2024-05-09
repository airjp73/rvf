import { RefCallback, useMemo } from "react";
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
import { useRvfOrContextInternal } from "./context";

export interface RvfField<FormInputData> {
  getInputProps: GetInputProps;
  getControlProps: (props?: {
    onChange?: (value: FormInputData) => void;
    onBlur?: () => void;
  }) => {
    onChange: (value: FormInputData) => void;
    onBlur: () => void;
    value: FormInputData;
    ref: RefCallback<HTMLElement>;
  };

  refs: {
    controlled: RefCallback<HTMLElement>;
    transient: RefCallback<HTMLElement>;
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
  validate(): void;
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

  const transientState = () => form.__store__.store.getState();

  const transientRef: RefCallback<HTMLElement> = (el) => {
    form.__store__.transientFieldRefs.setRef(fieldName, el);
    if (el && "value" in el)
      el.value = getFieldValue(transientState(), fieldName);
  };

  return {
    getInputProps: createGetInputProps({
      onChange,
      onBlur,
      defaultValue: getFieldDefaultValue(trackedState, fieldName),
      name: fieldName,
      ref: transientRef,
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
      transient: transientRef,
      controlled: (el) =>
        form.__store__.controlledFieldRefs.setRef(fieldName, el),
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
    validate: () => {
      void trackedState.validate();
    },
  };
};

export type UseFieldOpts = {
  validationBehavior?: ValidationBehaviorConfig;
};

export function useField<FormInputData>(
  form: Rvf<FormInputData>,
  { validationBehavior }?: UseFieldOpts,
): RvfField<FormInputData>;
export function useField<FormInputData = unknown>(
  name: string,
  opts?: UseFieldOpts,
): RvfField<FormInputData>;
export function useField<FormInputData>(
  formOrName: Rvf<FormInputData> | string,
  opts?: UseFieldOpts,
): RvfField<FormInputData> {
  const scope = useRvfOrContextInternal(formOrName);
  const prefix = scope.__field_prefix__;
  const trackedState = scope.__store__.useStoreState();

  // Accessing _something_ is required. Otherwise, it will rerender on every state update.
  // I saw this done in one of the dia-shi's codebases, too, but I can't find it now.
  trackedState.setValue;

  const base = useMemo(
    () =>
      makeFieldImpl({
        form: scope,
        fieldName: prefix,
        trackedState,
        validationBehavior: opts?.validationBehavior,
      }),
    [opts?.validationBehavior, prefix, scope, trackedState],
  );

  return base as never;
}
