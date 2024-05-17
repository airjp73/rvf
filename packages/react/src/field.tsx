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
  getFormId,
  setFormControlValue,
} from "@rvf/core";
import { GetInputProps, createGetInputProps } from "./inputs/getInputProps";
import { useRvfOrContextInternal } from "./context";
import { isFormControl } from "./inputs/logic/isFormControl";

export interface RvfField<FormInputData> {
  /**
   * Returns props that can be spread onto native form controls or thin wrappers around them.
   * It's important that the component you spread the props into accepts the `ref` prop.
   * This allows the field to be focused when it has an error and also disables RVF's default
   * behavior of automatically listening to changes in the field.
   */
  getInputProps: GetInputProps;

  /**
   * Returns props that can be spread into controlled components to use as a field.
   * It's important to pass the provided `ref` to something with a `focus` method.
   * This allows the field to be focused when it has an error and also disables RVF's default
   * behavior of automatically listening to changes in the field.
   */
  getControlProps: (props?: {
    onChange?: (value: FormInputData) => void;
    onBlur?: () => void;
  }) => {
    name: string;
    onChange: (value: FormInputData) => void;
    onBlur: () => void;
    value: FormInputData;
    ref: RefCallback<HTMLElement>;
  };

  /**
   * Returns props that can be spread into a native form control to use as a hidden field.
   * This is useful in combination with `getControlProps`.
   */
  getHiddenInputProps: (opts?: {
    /**
     * Serializes the value of the field before setting the `value` prop of the hidden input.
     */
    serialize?: (value: FormInputData) => string;
  }) => {
    name: string;
    value: string;
    type: "hidden";
    form: string;
  };

  refs: {
    controlled: () => RefCallback<HTMLElement>;
    transient: () => RefCallback<HTMLElement>;
  };

  /**
   * Gets the name of the field.
   */
  name: () => string;

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

  // This is a little hacky, but we can simplify when React adds ref cleanup functions.
  const createTransientRef = (): RefCallback<HTMLElement> => {
    const sym = Symbol(fieldName);
    return (el) => {
      if (el == null) {
        form.__store__.transientFieldRefs.removeRef(fieldName, sym);
        return;
      }

      form.__store__.transientFieldRefs.setRef(fieldName, el, sym);
      if (isFormControl(el)) {
        const value = getFieldValue(transientState(), fieldName);
        if (value != null) setFormControlValue(el, value);
      }
    };
  };

  const createControlledRef = (): RefCallback<HTMLElement> => {
    const sym = Symbol(fieldName);
    return (el) => {
      if (el == null) {
        form.__store__.controlledFieldRefs.removeRef(fieldName, sym);
        return;
      }

      form.__store__.controlledFieldRefs.setRef(fieldName, el, sym);
    };
  };

  return {
    getInputProps: createGetInputProps({
      onChange,
      onBlur,
      defaultValue: getFieldDefaultValue(trackedState, fieldName),
      name: fieldName,
      createRef: createTransientRef,
      formId: getFormId(trackedState),
      getCurrentValue: () =>
        getFieldValue(form.__store__.store.getState(), fieldName),
    }),

    getControlProps: (props = {}) => ({
      name: fieldName,
      onChange: (value) => {
        onChange(value);
        props.onChange?.(value);
      },
      onBlur: () => {
        onBlur();
        props.onBlur?.();
      },
      value: getFieldValue(trackedState, fieldName) as never,
      ref: createControlledRef(),
    }),

    getHiddenInputProps: ({
      serialize = (val: unknown) => val as string,
    } = {}) => ({
      name: fieldName,
      value: serialize(getFieldValue(trackedState, fieldName)),
      type: "hidden",
      form: getFormId(trackedState),
    }),

    refs: {
      transient: createTransientRef,
      controlled: createControlledRef,
    },

    name: () => fieldName,

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

export type FieldPropsWithScope<FormInputData> = {
  scope: Rvf<FormInputData>;
  children: (field: RvfField<FormInputData>) => React.ReactNode;
};

export type FieldPropsWithName<FormInputData> = {
  name: string;
  children: (field: RvfField<FormInputData>) => React.ReactNode;
};

export function Field<FormInputData = unknown>(
  props: FieldPropsWithName<FormInputData> | FieldPropsWithScope<FormInputData>,
): React.ReactNode {
  // not actually breaking rules here
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const field = "name" in props ? useField(props.name) : useField(props.scope);
  return props.children(field as RvfField<FormInputData>);
}
