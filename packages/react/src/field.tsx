import { RefCallback, useMemo } from "react";
import {
  FieldSerializer,
  FormStoreValue,
  FormScope,
  ValidationBehaviorConfig,
  getFieldDefaultValue,
  getFieldDirty,
  getFieldError,
  getFieldTouched,
  getFieldValue,
  getFormId,
  isEvent,
  onNativeChange,
} from "@rvf/core";
import { GetInputProps, createGetInputProps } from "./inputs/getInputProps";
import { useFormScopeOrContextInternal } from "./context";
import { createControlledRef, createTransientRef } from "./refs";

export type GetControlPropsParam<FieldValue> = {
  onChange?: (value: FieldValue) => void;
  onBlur?: () => void;
};

export type GetControlPropsResult<FieldValue> = {
  name: string;
  onChange: (value: FieldValue) => void;
  onBlur: () => void;
  value: FieldValue;
  ref: RefCallback<HTMLElement>;
};

export type GetHiddenInputPropsParam<FieldValue> = {
  serialize?: (value: FieldValue) => string;
};

export type GetHiddenInputPropsResult = {
  name: string;
  value: string;
  type: "hidden";
  form: string;
  ref: RefCallback<HTMLInputElement>;
};

export interface FieldApi<FormInputData> {
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
  getControlProps: (
    props?: GetControlPropsParam<FormInputData>,
  ) => GetControlPropsResult<FormInputData>;

  /**
   * Returns props that can be spread into a native form control to use as a hidden field.
   * This is useful in combination with `getControlProps`.
   */
  getHiddenInputProps: (
    opts?: GetHiddenInputPropsParam<FormInputData>,
  ) => GetHiddenInputPropsResult;

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
  form: FormScope<FormInputData>;
  trackedState: FormStoreValue;
  validationBehavior?: ValidationBehaviorConfig;
};

export const makeFieldImpl = <FormInputData,>({
  form,
  trackedState,
  validationBehavior,
}: FieldImplParams<FormInputData>): FieldApi<FormInputData> => {
  const fieldName = form.__field_prefix__;
  const onChange = (value: unknown) => {
    if (isEvent(value)) onNativeChange(value as Event, form.__store__);
    else trackedState.onFieldChange(fieldName, value, validationBehavior);
  };

  const onBlur = () => trackedState.onFieldBlur(fieldName, validationBehavior);

  const createSerializerRef = (
    serialize: FieldSerializer,
  ): RefCallback<HTMLElement> => {
    const sym = Symbol(fieldName);
    return (el) => {
      if (el == null) {
        form.__store__.fieldSerializerRefs.removeRef(fieldName, sym);
        return;
      }

      form.__store__.fieldSerializerRefs.setRef(fieldName, serialize, sym);
    };
  };

  return {
    getInputProps: createGetInputProps({
      onChange,
      onBlur,
      defaultValue: getFieldDefaultValue(trackedState, fieldName),
      name: fieldName,
      createRef: () => createTransientRef(fieldName, form),
      formId: getFormId(trackedState),
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
      ref: createControlledRef(fieldName, form),
    }),

    getHiddenInputProps: ({
      serialize = (val: unknown) => val as string,
    } = {}) => ({
      name: fieldName,
      value: serialize(getFieldValue(trackedState, fieldName) as never),
      type: "hidden",
      form: getFormId(trackedState),
      ref: createSerializerRef(serialize as never),
    }),

    refs: {
      transient: () => createTransientRef(fieldName, form),
      controlled: () => createControlledRef(fieldName, form),
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

type ScopeData<Scope> = Scope extends FormScope<infer Data> ? Data : never;

export function useField<Scope extends FormScope<any>>(
  form: Scope,
  { validationBehavior }?: UseFieldOpts,
): FieldApi<ScopeData<Scope>>;
export function useField<FormInputData = unknown>(
  name: string,
  opts?: UseFieldOpts,
): FieldApi<FormInputData>;
export function useField<FormInputData>(
  formOrName: FormScope<FormInputData> | string,
  opts?: UseFieldOpts,
): FieldApi<FormInputData> {
  const scope = useFormScopeOrContextInternal(formOrName);
  const prefix = scope.__field_prefix__;
  const trackedState = scope.__store__.useStoreState();

  // Accessing _something_ is required. Otherwise, it will rerender on every state update.
  // I saw this done in one of the dia-shi's codebases, too, but I can't find it now.
  trackedState.setValue;

  const base = useMemo(
    () =>
      makeFieldImpl({
        form: scope,
        trackedState,
        validationBehavior: opts?.validationBehavior,
      }),
    [opts?.validationBehavior, scope, trackedState],
  );

  return base as never;
}

export type FieldPropsWithScope<FormInputData> = {
  scope: FormScope<FormInputData>;
  children: (field: FieldApi<FormInputData>) => React.ReactNode;
};

export type FieldPropsWithName<FormInputData> = {
  name: string;
  children: (field: FieldApi<FormInputData>) => React.ReactNode;
};

export function Field<FormInputData = unknown>(
  props: FieldPropsWithName<FormInputData> | FieldPropsWithScope<FormInputData>,
): React.ReactNode {
  // not actually breaking rules here
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const field = "name" in props ? useField(props.name) : useField(props.scope);
  return props.children(field as FieldApi<FormInputData>);
}
