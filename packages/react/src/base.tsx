import { useMemo } from "react";
import {
  Rvf,
  scopeRvf,
  SubmitStatus,
  FormStoreValue,
  getFieldValue,
  getFieldDefaultValue,
  getFieldTouched,
  getFieldDirty,
  getFieldError,
} from "@rvf/core";
import {
  StringToPathTuple,
  ValidStringPaths,
  ValidStringPathsToArrays,
  ValueAtPath,
  getPath,
} from "set-get";
import { RvfArray, makeFieldArrayImpl } from "./array";
import { makeImplFactory } from "./implFactory";
import { RvfField, makeFieldImpl } from "./field";

type MinimalRvf<FieldPaths extends string> = {
  resetField: (fieldName: FieldPaths, nextValue?: any) => void;
};

export type FormFields<Form> =
  Form extends MinimalRvf<infer FieldPaths> ? FieldPaths : never;

interface FormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: (event: React.FormEvent<HTMLFormElement>) => void;
  ref: React.Ref<HTMLFormElement>;
}

export interface RvfReact<FormInputData> {
  /**
   * Gets whether the field has been touched.
   * @willRerender
   */
  touched: (fieldName?: ValidStringPaths<FormInputData>) => boolean;

  /**
   * Gets whether the field has been dirty.
   * @willRerender
   */
  dirty: (fieldName?: ValidStringPaths<FormInputData>) => boolean;

  /**
   * Gets the current error for the field if any.
   * @willRerender
   */
  error: (fieldName?: ValidStringPaths<FormInputData>) => string | null;

  /**
   * Gets the current value of the entire form.
   * If using a scoped form, this will be the value of the scoped form.
   * @willRerender
   */
  value(): FormInputData;

  /**
   * Gets the current value of the specified field.
   * @willRerender
   */
  value<Field extends ValidStringPaths<FormInputData>>(
    fieldName: Field,
  ): ValueAtPath<FormInputData, StringToPathTuple<Field>>;

  /**
   * Gets the default value of the entire form.
   * If using a scoped form, this will be the value of the scoped form.
   * @willRerender
   */
  defaultValue(): FormInputData;

  /**
   * Gets the default value of the specified field.
   * @willRerender
   */
  defaultValue<Field extends ValidStringPaths<FormInputData>>(
    fieldName: Field,
  ): ValueAtPath<FormInputData, StringToPathTuple<Field>>;

  formState: {
    isSubmitting: boolean;
    hasBeenSubmitted: boolean;
    submitStatus: SubmitStatus;

    isValid: boolean;
    isDirty: boolean;
    isTouched: boolean;
  };

  /**
   * Various subscription helpers. These should be used in an effect and do not cause rerenders.
   */
  subscribe: {
    /**
     * Subscribes to any change in the values of the form.
     * @returns A function that can be called to unsubscribe.
     * @example `useEffect(() => form.subscribe.value(console.log), [])`
     */
    value(callback: (values: FormInputData) => void): () => void;

    /**
     * Subscribes to any change in value of the specified field.
     * @returns A function that can be called to unsubscribe.
     * @example `useEffect(() => form.subscribe.value('myfield', console.log), [])`
     */
    value<Field extends ValidStringPaths<FormInputData>>(
      fieldName: Field,
      callback: (
        values: ValueAtPath<FormInputData, StringToPathTuple<Field>>,
      ) => void,
    ): () => void;
  };

  /**
   * Focus the field with the specified name.
   * This only works if the `ref` provided by `field`, `control`, or `checkbox` was passed to a focusable element.
   */
  focus: (fieldName: ValidStringPaths<FormInputData>) => void;

  /**
   * Sets the value of the field with the specified name.
   * This works for both controlled and uncontrolled fields.
   * For uncontrolled fields, this will manually set the value of the form control using the `ref` returned by `field`.
   */
  setValue<Field extends ValidStringPaths<FormInputData>>(
    fieldName: Field,
    value: ValueAtPath<FormInputData, StringToPathTuple<Field>>,
  ): void;

  /**
   * Sets the value of the entire scope of this form.
   * This is most useful when using an already scoped form.
   */
  setValue(value: FormInputData): void;

  /**
   * Set the dirty state of the specified field.
   */
  setDirty(fieldName: ValidStringPaths<FormInputData>, value: boolean): void;

  /**
   * Set the dirty state of the field in scope.
   */
  setDirty(value: boolean): void;

  /**
   * Set the touched state of the specified field.
   */
  setTouched(fieldName: ValidStringPaths<FormInputData>, value: boolean): void;

  /**
   * Set the touched state of the field in scope.
   */
  setTouched(value: boolean): void;

  /**
   * Clears the error of the specified field.
   */
  clearError(fieldName: ValidStringPaths<FormInputData>): void;

  /**
   * Set the current error of the field in scope.
   */
  clearError(): void;

  /**
   * Manually validates the form.
   * You usually don't need to do this.
   */
  validate: () => Promise<Record<string, string>>;

  /**
   * Resets the form to its initial state.
   * All fields will be reset to their initial values.
   * All touched, dirty, and validation errors will be reset.
   * Optionally, you can provide new initial values to reset.
   */
  resetForm: (nextValues?: FormInputData) => void;

  /**
   * Resets the field with the specified name to its initial value.
   * This also resets any touched, dirty, or validation errors for the field.
   * This works for both controlled and uncontrolled fields.
   * For uncontrolled fields, this will manually set the value of the form control using the `ref` returned by `field`.
   */
  resetField: (
    fieldName: ValidStringPaths<FormInputData>,
    nextValue?: unknown,
  ) => void;

  /**
   * Creates an `Rvf` scoped to the specified field.
   * This is useful for creating subforms.
   * In order to use this, you can pass it to `useRvf`.
   *
   * @example
   * ```tsx
   * type PersonFormProps = {
   *   rvf: Rvf<{ name: string }>;
   * }
   *
   * const PersonForm = ({ rvf }: PersonFormProps) => {
   *   const form = useRvf(rvf);
   *   return (
   *     <div>
   *       <MyInputField lable="Name" {...personForm.field('name')} />
   *     </div>
   *   );
   * };
   *
   * const LargerForm = () => {
   *   const form = useRvf({
   *     defaultValues: {
   *       person: {
   *         name: "",
   *       },
   *     },
   *     // ... other options
   *   });
   *   return (
   *     <div>
   *       <PersonForm rvf={form.scope('person')} />
   *     </div>
   *   );
   * }
   * ```
   */
  scope<Field extends ValidStringPaths<FormInputData>>(
    fieldName: Field,
  ): Rvf<ValueAtPath<FormInputData, StringToPathTuple<Field>>>;

  /**
   * Returns an `Rvf` without scoping any further.
   */
  scope(): Rvf<FormInputData>;

  getFormProps: (props: Partial<FormProps>) => FormProps;

  /**
   * Get array helpers for the form.
   * This is only useful if you're using a form that has been scoped to an array.
   */
  array(
    _no_args: FormInputData extends Array<any> ? void : never,
  ): FormInputData extends Array<any> ? RvfArray<FormInputData> : never;

  /**
   * Get array helpers for the specified field array.
   */
  array<Field extends ValidStringPathsToArrays<FormInputData>>(
    fieldName: Field,
  ): ValueAtPath<FormInputData, StringToPathTuple<Field>> extends Array<any>
    ? RvfArray<ValueAtPath<FormInputData, StringToPathTuple<Field>>>
    : never;

  /**
   * Get field helpers for the specified field.
   */
  field<Field extends ValidStringPaths<FormInputData>>(
    fieldName: Field,
  ): RvfField<ValueAtPath<FormInputData, StringToPathTuple<Field>>>;

  /**
   * Get field helpers for the field in scope.
   * This is only useful if you're using a form that has been scoped to a single field.
   */
  field(): RvfField<FormInputData>;

  /**
   * Pass this to your form's `onSubmit` handler.
   */
  submit: () => void;
}

// type WithOptionalField<T> = [name?: string, arg?: T] | [arg?: T];
// const optionalField = <T,>(
//   args: WithOptionalField<T>,
// ): [string | undefined, T | undefined] => {
//   if (args.length === 0) return [undefined, undefined];

//   if (args.length === 1) {
//     if (typeof args[0] === "string") return [args[0], undefined];
//     return [prefix, args[0]];
//   }

//   if (typeof args[0] === "string") return [args[0], args[1]];
//   throw new Error("Unknown args for field helper");
// };

export type BaseRvfReactParams<FormInputData> = {
  form: Rvf<FormInputData>;
  prefix: string;
  trackedState: FormStoreValue;
};

export const makeBaseRvfReact = <FormInputData,>({
  trackedState,
  prefix,
  form,
}: BaseRvfReactParams<FormInputData>): RvfReact<FormInputData> => {
  const f = (fieldName?: string) =>
    [prefix, fieldName].filter(Boolean).join(".");
  const transientState = () => form.__store__.store.getState();

  type WithOptionalField<T> = [string, T] | [T];
  const optionalField = <T,>(args: [string, T] | [T]): [string, T] =>
    args.length === 1 ? [prefix, args[0]] : [f(args[0]), args[1]];

  const arrayImpl = makeImplFactory(prefix, (arrayFieldName) =>
    makeFieldArrayImpl({
      trackedState,
      arrayFieldName,
      form: scopeRvf(form, arrayFieldName) as Rvf<any[]>,
    }),
  );

  const fieldImpl = makeImplFactory(prefix, (fieldName) =>
    makeFieldImpl({
      form,
      fieldName,
      trackedState,
    }),
  );

  return {
    value: (fieldName?: string) =>
      getFieldValue(trackedState, f(fieldName)) as any,
    defaultValue: (fieldName?: string) =>
      getFieldDefaultValue(trackedState, f(fieldName)) as any,
    touched: (fieldName) => getFieldTouched(trackedState, f(fieldName)),
    dirty: (fieldName) => getFieldDirty(trackedState, f(fieldName)),
    error: (fieldName) => getFieldError(trackedState, f(fieldName)),

    formState: {
      get isSubmitting() {
        return trackedState.submitStatus === "submitting";
      },
      get hasBeenSubmitted() {
        return trackedState.submitStatus !== "idle";
      },
      get isDirty() {
        return Object.values(trackedState.dirtyFields).some(Boolean);
      },
      get isTouched() {
        return Object.values(trackedState.touchedFields).some(Boolean);
      },
      get isValid() {
        return Object.values(trackedState.validationErrors).every(
          (error) => !error,
        );
      },
      get submitStatus() {
        return trackedState.submitStatus;
      },
    },

    subscribe: {
      value: (...args: unknown[]) => {
        type BothParams = [string | undefined, (value: unknown) => void];
        const [fieldName, callback] = (
          args.length === 1 ? [undefined, args[0]] : args
        ) as BothParams;

        return form.__store__.store.subscribe((state, prevState) => {
          const value = fieldName
            ? getPath(state.values, fieldName)
            : state.values;
          const prevValue = fieldName
            ? getPath(prevState.values, fieldName)
            : prevState.values;
          if (prevValue === value) return;
          callback(value as FormInputData);
        });
      },
    },

    setValue: (...args: WithOptionalField<unknown>) =>
      transientState().setValue(...optionalField(args)),
    setDirty: (...args: WithOptionalField<boolean>) =>
      transientState().setDirty(...optionalField(args)),
    setTouched: (...args: WithOptionalField<boolean>) =>
      transientState().setTouched(...optionalField(args)),
    clearError: (fieldName?: string) =>
      transientState().setError(f(fieldName), null),

    focus: (fieldName) => {
      const element =
        form.__store__.transientFieldRefs.getRef(f(fieldName)) ??
        form.__store__.controlledFieldRefs.getRef(f(fieldName));
      if (element && "focus" in element) element.focus();
    },

    validate: () => form.__store__.store.getState().validate(),
    resetForm: (...args) =>
      form.__store__.store.getState().reset(...(args as any)),
    resetField: (fieldName, nextValue) =>
      form.__store__.store.getState().resetField(f(fieldName), nextValue),

    scope: (fieldName?: string) =>
      fieldName == null ? form : (scopeRvf(form, fieldName) as any),

    array: arrayImpl as never,
    field: fieldImpl as never,

    getFormProps: (formProps = {}) => ({
      ...formProps,
      onSubmit: (event) => {
        formProps.onSubmit?.(event);
        if (event.defaultPrevented) return;

        event.preventDefault();
        transientState().onSubmit();
      },
      onReset: (event) => {
        formProps.onReset?.(event);
        if (event.defaultPrevented) return;
        transientState().reset();
      },
      ref: (el) => {
        if (typeof formProps.ref === "function") formProps.ref(el);
        else if (formProps.ref) {
          (formProps.ref as any).current = el;
        }

        form.__store__.formRef.current = el;
      },
    }),

    submit: () => {
      trackedState.onSubmit();
    },
  };
};

export const useRvfInternal = <FormInputData,>(form: Rvf<FormInputData>) => {
  const prefix = form.__field_prefix__;
  const { useStoreState } = form.__store__;
  const trackedState = useStoreState();

  // Accessing _something_ is required. Otherwise, it will rerender on every state update.
  // I saw this done in one of the dia-shi's codebases, too, but I can't find it now.
  trackedState.setValue;

  const base = useMemo(
    () =>
      makeBaseRvfReact({
        form,
        prefix,
        trackedState,
      }),
    [form, prefix, trackedState],
  );

  return base;
};