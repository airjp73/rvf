import {
  useEffect,
  useState,
  useId,
  useLayoutEffect,
  ComponentProps,
} from "react";
import {
  FieldValues,
  ValidationBehaviorConfig,
  Validator,
  Rvf,
  createRvf,
  registerFormElementEvents,
  StateSubmitHandler,
  DomSubmitHandler,
} from "@rvf/core";
import { RvfReact, useRvfInternal } from "./base";
import { FieldErrors } from "@rvf/core";

const noOp = () => {};

type RvfSubmitOpts<FormOutputData, ResponseData> =
  | {
      submitSource?: "state";
      handleSubmit: StateSubmitHandler<FormOutputData, ResponseData>;
    }
  | {
      submitSource: "dom";
      handleSubmit?: DomSubmitHandler<FormOutputData, ResponseData>;
    };

export type RvfOpts<
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
   * This is primarily useful for writing custom hooks around `useRvf`.
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
} & RvfSubmitOpts<FormOutputData, SubmitResponseData>;

const isRvf = (form: any): form is Rvf<any> =>
  "__brand__" in form && form.__brand__ === "rvf";

/**
 * Create and use an `Rvf`.
 */
export function useRvf<
  FormInputData extends FieldValues,
  FormOutputData,
  SubmitResponseData,
>(
  options: RvfOpts<FormInputData, FormOutputData, SubmitResponseData>,
): RvfReact<FormInputData>;

/**
 * Interprets an `Rvf` created via `form.scope`, for use in a subcomponent.
 */
export function useRvf<FormInputData>(
  form: Rvf<FormInputData>,
): RvfReact<FormInputData>;

export function useRvf(
  optsOrForm:
    | RvfOpts<any, unknown>
    | Omit<RvfOpts<any, unknown>, "defaultValues">
    | Rvf<unknown>,
): RvfReact<any> {
  const validator = isRvf(optsOrForm) ? undefined : optsOrForm.validator;
  const onSubmit = isRvf(optsOrForm) ? undefined : optsOrForm.handleSubmit;
  const onSubmitSuccess = isRvf(optsOrForm)
    ? undefined
    : optsOrForm.onSubmitSuccess;
  const onSubmitFailure = isRvf(optsOrForm)
    ? undefined
    : optsOrForm.onSubmitFailure;
  const isWholeForm = isRvf(optsOrForm);
  const submitSource = isRvf(optsOrForm) ? undefined : optsOrForm.submitSource;
  const action = isRvf(optsOrForm) ? undefined : optsOrForm.action;
  const disableFocusOnError = isRvf(optsOrForm)
    ? undefined
    : optsOrForm.disableFocusOnError;
  const serverValidationErrors = isRvf(optsOrForm)
    ? undefined
    : optsOrForm.serverValidationErrors;
  const resetAfterSubmit = isRvf(optsOrForm)
    ? undefined
    : optsOrForm.resetAfterSubmit;
  const otherFormProps = isRvf(optsOrForm)
    ? undefined
    : optsOrForm.otherFormProps;
  const reloadDocument = isRvf(optsOrForm)
    ? undefined
    : optsOrForm.reloadDocument;

  const providedFormId = isRvf(optsOrForm) ? undefined : optsOrForm.formId;
  const defaultFormId = useId();

  const [form] = useState<Rvf<unknown>>(() => {
    if (isRvf(optsOrForm)) return optsOrForm;
    const rvf = createRvf({
      defaultValues:
        "defaultValues" in optsOrForm && optsOrForm.defaultValues
          ? optsOrForm.defaultValues
          : {},
      serverValidationErrors: serverValidationErrors ?? {},
      validator: optsOrForm.validator,
      onSubmit: optsOrForm.handleSubmit as never,
      onSubmitSuccess: (data) => {
        optsOrForm.onSubmitSuccess?.(data);
        if (resetAfterSubmit) rvf.__store__.store.getState().reset();
      },
      onSubmitFailure: optsOrForm.onSubmitFailure ?? noOp,
      validationBehaviorConfig: optsOrForm.validationBehaviorConfig,
      submitSource: optsOrForm.submitSource ?? "dom",
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

  const initial = isRvf(optsOrForm)
    ? undefined
    : optsOrForm.validationBehaviorConfig?.initial;
  const whenSubmitted = isRvf(optsOrForm)
    ? undefined
    : optsOrForm.validationBehaviorConfig?.whenSubmitted;
  const whenTouched = isRvf(optsOrForm)
    ? undefined
    : optsOrForm.validationBehaviorConfig?.whenTouched;

  useEffect(() => {
    if (isWholeForm) return;

    Object.assign(form.__store__.mutableImplStore, {
      validator: validator as any,
      onSubmit,
      onSubmitSuccess: (data: unknown) => {
        optsOrForm.onSubmitSuccess?.(data);
        if (resetAfterSubmit) form.__store__.store.getState().reset();
      },
      onSubmitFailure,
    });
  }, [
    validator,
    onSubmit,
    isWholeForm,
    form.__store__.mutableImplStore,
    onSubmitSuccess,
    onSubmitFailure,
    form.__store__.store,
    resetAfterSubmit,
    optsOrForm,
  ]);

  useEffect(() => {
    if (isWholeForm) return;

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
    isWholeForm,
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
    if (isWholeForm || !serverValidationErrors) return;
    form.__store__.store
      .getState()
      .syncServerValidationErrors(serverValidationErrors);
  }, [serverValidationErrors, form.__store__.store, isWholeForm]);

  return useRvfInternal(form) as never;
}
