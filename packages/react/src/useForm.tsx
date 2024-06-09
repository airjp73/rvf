import { useEffect, useState, useId, ComponentProps, useMemo } from "react";
import {
  FieldValues,
  ValidationBehaviorConfig,
  Validator,
  FormScope,
  createFormScope,
  registerFormElementEvents,
  StateSubmitHandler,
  DomSubmitHandler,
} from "@rvf/core";
import { ReactFormApi, useFormInternal } from "./base";
import { FieldErrors } from "@rvf/core";

const noOp = () => {};

type FormSubmitOpts<FormOutputData, ResponseData> =
  | {
      submitSource?: "state";
      handleSubmit: StateSubmitHandler<FormOutputData, ResponseData>;
    }
  | {
      submitSource: "dom";
      handleSubmit?: DomSubmitHandler<FormOutputData, ResponseData>;
    };

export type FormOpts<
  FormInputData extends FieldValues = FieldValues,
  FormOutputData = never,
  SubmitResponseData = unknown,
> = {
  /**
   * The initial values of the form.
   * It's recommended that you provide a default value for every field in the form.
   */
  defaultValues?: FormInputData;

  /**
   * Can be used to set the default errors of the entire form.
   * This is most useful went integrating with server-side validation.
   *
   * **CAREFUL**: this will cause an update every time the identity of `serverValidationErrors` changes.
   * So make sure the identity of `serverValidationErrors` is stable.
   */
  serverValidationErrors?: FieldErrors;

  /**
   * A function that validates the form's values.
   * This is most commonly used in combination with an adapter for a particular validation library like `zod`.
   */
  validator: Validator<FormOutputData>;

  /**
   * Allows you to customize the validation behavior of the form.
   */
  validationBehaviorConfig?: ValidationBehaviorConfig;

  /**
   * The action prop of the form element.
   */
  action?: string;

  /**
   * The id of the form element.
   */
  formId?: string;

  /**
   * Disables the default behavior of focusing the first invalid field when a submit fails due to validation errors.
   */
  disableFocusOnError?: boolean;

  /**
   * When set to true, a valid form will be submitted natively with a full page reload.
   * _Note_: This is only supported in the `dom` submit source.
   */
  reloadDocument?: boolean;

  /**
   * Optionally, you can pass other props to the form element here.
   * This is primarily useful for writing custom hooks around `useForm`.
   * For most use-cases, you can simply pass the props directly to the form element.
   */
  otherFormProps?: Omit<ComponentProps<"form">, "id" | "action">;

  /**
   * Called when the form is successfully submitted using `handleSubmit`.
   */
  onSubmitSuccess?: (handleSubmitResponse: NoInfer<SubmitResponseData>) => void;

  /**
   * Called when handleSubmit throws an error, and provides the error from the handleSubmit function.
   * This will not be called if the validator prevents the submission from happening.
   */
  onSubmitFailure?: (error: unknown) => void;

  /**
   * A shortcut setting that resets the form to the default values after the form has been successfully submitted.
   * This is equivalent to calling `resetForm` in the `onSubmitSuccess` callback.
   */
  resetAfterSubmit?: boolean;
} & FormSubmitOpts<FormOutputData, SubmitResponseData>;

const isFormScope = (form: any): form is FormScope<any> =>
  "__brand__" in form && form.__brand__ === "rvf";

/**
 * Create and use an `FormScope`.
 */
export function useForm<
  FormInputData extends FieldValues,
  FormOutputData,
  SubmitResponseData,
>(
  options: FormOpts<FormInputData, FormOutputData, SubmitResponseData>,
): ReactFormApi<FormInputData> {
  // everything from below
  const {
    validator,
    handleSubmit: onSubmit,
    onSubmitSuccess,
    onSubmitFailure,
    submitSource,
    action,
    disableFocusOnError,
    serverValidationErrors,
    resetAfterSubmit,
    otherFormProps,
    reloadDocument,
    validationBehaviorConfig,
    formId: providedFormId,
  } = options;

  const defaultFormId = useId();

  const [form] = useState<FormScope<unknown>>(() => {
    const rvf = createFormScope({
      defaultValues: options.defaultValues ?? {},
      serverValidationErrors: serverValidationErrors ?? {},
      validator,
      onSubmit: onSubmit as never,
      onSubmitSuccess: (data) => {
        onSubmitSuccess?.(data as SubmitResponseData);
        if (resetAfterSubmit) rvf.__store__.store.getState().reset();
      },
      onSubmitFailure: onSubmitFailure ?? noOp,
      validationBehaviorConfig: validationBehaviorConfig,
      submitSource: submitSource ?? "dom",
      formProps: {
        action,
        id: providedFormId ?? defaultFormId,
        ...otherFormProps,
      },
      flags: {
        disableFocusOnError: disableFocusOnError ?? false,
        reloadDocument: reloadDocument ?? false,
      },
    });
    return rvf;
  });

  useEffect(() => {
    return registerFormElementEvents(form.__store__);
  }, [form.__store__]);

  const { initial, whenSubmitted, whenTouched } =
    validationBehaviorConfig ?? {};

  useEffect(() => {
    Object.assign(form.__store__.mutableImplStore, {
      validator: validator as any,
      onSubmit,
      onSubmitSuccess: (data: unknown) => {
        onSubmitSuccess?.(data as SubmitResponseData);
        if (resetAfterSubmit) form.__store__.store.getState().reset();
      },
      onSubmitFailure,
    });
  }, [
    validator,
    onSubmit,
    form.__store__.mutableImplStore,
    onSubmitSuccess,
    onSubmitFailure,
    form.__store__.store,
    resetAfterSubmit,
  ]);

  useEffect(() => {
    form.__store__.store.getState().syncOptions({
      submitSource: submitSource ?? "dom",
      validationBehaviorConfig:
        initial && whenSubmitted && whenTouched
          ? {
              initial,
              whenSubmitted,
              whenTouched,
            }
          : undefined,
      formProps: {
        action,
        id: providedFormId ?? defaultFormId,
        ...otherFormProps,
      },
      flags: {
        disableFocusOnError: disableFocusOnError ?? false,
        reloadDocument: reloadDocument ?? false,
      },
    });
  }, [
    form.__store__.store,
    initial,
    submitSource,
    whenSubmitted,
    whenTouched,
    action,
    providedFormId,
    defaultFormId,
    disableFocusOnError,
    otherFormProps,
    reloadDocument,
  ]);

  useEffect(() => {
    if (!serverValidationErrors) return;
    form.__store__.store
      .getState()
      .syncServerValidationErrors(serverValidationErrors ?? {});
  }, [serverValidationErrors, form.__store__.store]);

  return useFormInternal(form) as never;
}
