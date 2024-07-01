import { useEffect, useMemo } from "react";
import * as R from "remeda";
import {
  FormScope,
  scopeFormScope,
  SubmitStatus,
  FormStoreValue,
  getFieldValue,
  getFieldDefaultValue,
  getFieldTouched,
  getFieldDirty,
  getFieldError,
  focusFirst,
  getAllTouched,
  getAllDirty,
  getAllErrors,
  getFormAction,
  getFormId,
  getFormProps,
  SubmitterOptions,
  FORM_ID_FIELD_NAME,
} from "@rvf/core";
import {
  StringToPathTuple,
  ValidStringPaths,
  ValidStringPathsToArrays,
  ValueAtPath,
  getPath,
  pathArrayToString,
} from "@rvf/set-get";
import { FieldArrayApi, makeFieldArrayImpl } from "./array";
import { makeImplFactory } from "./implFactory";
import {
  GetControlPropsParam,
  GetControlPropsResult,
  GetHiddenInputPropsParam,
  GetHiddenInputPropsResult,
  FieldApi,
  makeFieldImpl,
} from "./field";
import {
  GetInputPropsParam,
  MinimalInputProps,
  ValidInputPropsValues,
} from "./inputs/getInputProps";

type MinimalFormScope<FieldPaths extends string> = {
  resetField: (fieldName: FieldPaths, nextValue?: any) => void;
};

export type FormFields<Form> =
  Form extends MinimalFormScope<infer FieldPaths> ? FieldPaths : never;

interface FormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: (event: React.FormEvent<HTMLFormElement>) => void;
  ref: React.Ref<HTMLFormElement>;
  id: string;
  action?: string;
}

export type ManualSubmitOption = SubmitterOptions & {
  name?: string;
  value?: string;
};

export interface ReactFormApi<FormInputData> {
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

  formOptions: {
    action?: string;
    formId: string;
  };

  formState: {
    isSubmitting: boolean;
    hasBeenSubmitted: boolean;
    submitStatus: SubmitStatus;

    isValid: boolean;
    isDirty: boolean;
    isTouched: boolean;

    touchedFields: Record<string, boolean>;
    dirtyFields: Record<string, boolean>;
    fieldErrors: Record<string, string>;
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
   * Creates an `FormScope` scoped to the specified field.
   * This is useful for creating subforms.
   * In order to use this, you can pass it to `useForm`.
   *
   * @example
   * ```tsx
   * type PersonFormProps = {
   *   rvf: FormScope<{ name: string }>;
   * }
   *
   * const PersonForm = ({ rvf }: PersonFormProps) => {
   *   const form = useForm(rvf);
   *   return (
   *     <div>
   *       <MyInputField lable="Name" {...personForm.field('name')} />
   *     </div>
   *   );
   * };
   *
   * const LargerForm = () => {
   *   const form = useForm({
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
  ): FormScope<ValueAtPath<FormInputData, StringToPathTuple<Field>>>;

  /**
   * Returns an `FormScope` without scoping any further.
   */
  scope(): FormScope<FormInputData>;

  getFormProps: (props?: Partial<FormProps>) => FormProps;

  /**
   * Get array helpers for the form.
   * This is only useful if you're using a form that has been scoped to an array.
   */
  array(
    _no_args: FormInputData extends Array<any> ? void : never,
  ): FormInputData extends Array<any> ? FieldArrayApi<FormInputData> : never;

  /**
   * Get array helpers for the specified field array.
   */
  array<Field extends ValidStringPathsToArrays<FormInputData>>(
    fieldName: Field,
  ): ValueAtPath<FormInputData, StringToPathTuple<Field>> extends Array<any>
    ? FieldArrayApi<ValueAtPath<FormInputData, StringToPathTuple<Field>>>
    : never;

  /**
   * Get the name of the specified field.
   */
  name<Field extends ValidStringPaths<FormInputData>>(fieldName: Field): string;

  /**
   * Get the name of the current field in scope.
   */
  name(): string;

  /**
   * Returns props that can be spread onto native form controls or thin wrappers around them.
   * It's important that the component you spread the props into accepts the `ref` prop.
   * This allows RVF to set the value of the field when setValue is called, and is used
   * to focus the field when it has an error.
   */
  getInputProps: <
    Field extends ValidStringPaths<FormInputData, ValidInputPropsValues>,
    T extends MinimalInputProps,
  >(
    fieldName: Field,
    props?: GetInputPropsParam<T>,
  ) => T;

  /**
   * Returns props that can be spread into controlled components to use as a field.
   * It's important to pass the provided `ref` to something with a `focus` method.
   * This allows the field to be focused when it has an error and also disables RVF's default
   * behavior of automatically listening to changes in the field.
   * @willRerender
   */
  getControlProps: <Field extends ValidStringPaths<FormInputData>>(
    name: Field,
    props?: GetControlPropsParam<
      ValueAtPath<FormInputData, StringToPathTuple<Field>>
    >,
  ) => GetControlPropsResult<
    ValueAtPath<FormInputData, StringToPathTuple<Field>>
  >;

  /**
   * Returns props that can be spread into a native form control to use as a hidden field.
   * This is useful in combination with `getControlProps`.
   * @willRerender
   */
  getHiddenInputProps: <Field extends ValidStringPaths<FormInputData>>(
    name: Field,
    opts?: GetHiddenInputPropsParam<
      ValueAtPath<FormInputData, StringToPathTuple<Field>>
    >,
  ) => GetHiddenInputPropsResult;

  /**
   * Get field helpers for the specified field.
   */
  field<Field extends ValidStringPaths<FormInputData>>(
    fieldName: Field,
  ): FieldApi<ValueAtPath<FormInputData, StringToPathTuple<Field>>>;

  /**
   * Get field helpers for the field in scope.
   * This is only useful if you're using a form that has been scoped to a single field.
   */
  field(): FieldApi<FormInputData>;

  /**
   * Pass this to your form's `onSubmit` handler.
   */
  submit: (option?: ManualSubmitOption) => void;

  /**
   * Renders a hidden input that sets passes the form id to your server.
   * This is only useful if you're supporting users who don't have JS enabled
   * and you're returning validation errors from your server.
   */
  renderFormIdInput: () => React.ReactNode;
}

export type BaseReactFormParams<FormInputData> = {
  form: FormScope<FormInputData>;
  trackedState: FormStoreValue;
};

export const makeBaseReactFormApi = <FormInputData,>({
  trackedState,
  form,
}: BaseReactFormParams<FormInputData>): ReactFormApi<FormInputData> => {
  const prefix = form.__field_prefix__;
  const f = (fieldName?: string) =>
    pathArrayToString([prefix, fieldName].filter(R.isNonNullish));
  const transientState = () => form.__store__.store.getState();

  type WithOptionalField<T> = [string, T] | [T];
  const optionalField = <T,>(args: [string, T] | [T]): [string, T] =>
    args.length === 1 ? [prefix, args[0]] : [f(args[0]), args[1]];

  const arrayImpl = makeImplFactory(prefix, (arrayFieldName) =>
    makeFieldArrayImpl({
      trackedState,
      form: scopeFormScope(form, arrayFieldName) as FormScope<any[]>,
    }),
  );

  const fieldImpl = makeImplFactory(prefix, (fieldName) =>
    makeFieldImpl({
      form: scopeFormScope(form, fieldName) as FormScope<any>,
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

    formOptions: {
      get action() {
        return getFormAction(trackedState);
      },
      get formId() {
        return getFormId(trackedState);
      },
    },

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

      get touchedFields() {
        return getAllTouched(trackedState);
      },

      get dirtyFields() {
        return getAllDirty(trackedState);
      },

      get fieldErrors() {
        return getAllErrors(trackedState);
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
      const elements = [
        ...form.__store__.transientFieldRefs.getRefs(f(fieldName)),
        ...form.__store__.controlledFieldRefs.getRefs(f(fieldName)),
      ];
      focusFirst(elements);
    },

    validate: () =>
      form.__store__.store
        .getState()
        .validate()
        .then((res) => res.errors ?? {}),
    resetForm: (...args) => {
      // TODO: This ends up calling the store's `reset` method twice.
      // That gets the job done, but it's not ideal.
      const formElement = form.__store__.formRef.current;
      if (formElement) formElement.reset();
      form.__store__.store.getState().reset(...(args as any));
    },
    resetField: (fieldName, nextValue) =>
      form.__store__.store.getState().resetField(f(fieldName), nextValue),

    scope: (fieldName?: string) =>
      fieldName == null ? form : (scopeFormScope(form, fieldName) as any),

    name: (fieldName?: string) => f(fieldName),

    array: arrayImpl as never,
    field: fieldImpl as never,

    getFormProps: (formProps = {}) => ({
      ...formProps,
      ...getFormProps(trackedState),
      onSubmit: (event) => {
        formProps.onSubmit?.(event);
        if (event.defaultPrevented) return;

        event.preventDefault();

        type HTMLSubmitEvent = React.BaseSyntheticEvent<
          SubmitEvent,
          Event,
          HTMLFormElement
        >;

        type HTMLFormSubmitter = HTMLButtonElement | HTMLInputElement;

        const nativeEvent = event.nativeEvent as HTMLSubmitEvent["nativeEvent"];
        const submitter = nativeEvent.submitter as HTMLFormSubmitter | null;

        const submitterData =
          submitter?.name != null
            ? { [submitter.name]: submitter.value }
            : undefined;

        // Don't include option at all if the aren't provided
        const submitterOptions: SubmitterOptions = {};
        if (submitter?.formEnctype)
          submitterOptions.formEnctype = submitter.formEnctype;
        if (submitter?.formMethod)
          submitterOptions.formMethod = submitter.formMethod;
        if (submitter?.formNoValidate)
          submitterOptions.formNoValidate = submitter.formNoValidate;

        // The button will always have a `formAction` and it may be different from the form's `action`.
        // What we really want to check is if the button has an explicit `formAction` attribute.
        const buttonFormAction = submitter?.getAttribute("formAction");
        if (buttonFormAction) submitterOptions.formAction = buttonFormAction;

        transientState().onSubmit(submitterData, submitterOptions);
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

    getInputProps: (fieldName, props) =>
      fieldImpl(fieldName).getInputProps(props),

    getControlProps: (fieldName, props) =>
      fieldImpl(fieldName).getControlProps(props as never) as never,

    getHiddenInputProps: (fieldName, props) =>
      fieldImpl(fieldName).getHiddenInputProps(props as never),

    submit: (options) => {
      const submitterData =
        options?.name && options?.value
          ? { [options.name]: options.value }
          : undefined;

      const submitterOptions = {
        formEnctype: options?.formEnctype,
        formMethod: options?.formMethod,
        formNoValidate: options?.formNoValidate,
        formAction: options?.formAction,
      };
      trackedState.onSubmit(submitterData, submitterOptions);
    },

    renderFormIdInput: () => {
      const formId = getFormId(trackedState);
      if (!formId) return null;
      return <input type="hidden" name={FORM_ID_FIELD_NAME} value={formId} />;
    },
  };
};

export const useFormInternal = <FormInputData,>(
  form: FormScope<FormInputData>,
) => {
  const { useStoreState, resolvers } = form.__store__;
  const trackedState = useStoreState();

  // Flush on every update
  useEffect(() => {
    resolvers.flush();
  });

  // Accessing _something_ is required. Otherwise, it will rerender on every state update.
  // I saw this done in one of the dia-shi's codebases, too, but I can't find it now.
  trackedState.setValue;

  const base = useMemo(
    () =>
      makeBaseReactFormApi({
        form,
        trackedState,
      }),
    [form, trackedState],
  );

  return base;
};
