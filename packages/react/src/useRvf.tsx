import { useEffect, useState, useId, useLayoutEffect } from "react";
import {
  FieldValues,
  ValidationBehaviorConfig,
  Validator,
  Rvf,
  createRvf,
  registerFormElementEvents,
} from "@rvf/core";
import { RvfReact, useRvfInternal } from "./base";
import { FieldErrors } from "@rvf/core";

type RvfSubmitOpts<FormOutputData> =
  | {
      submitSource?: "state";
      handleSubmit: (data: FormOutputData) => Promise<void> | void;
    }
  | {
      submitSource: "dom";
      handleSubmit?: (
        data: FormOutputData,
        formData: FormData,
      ) => Promise<void> | void;
    };

export type RvfOpts<
  FormInputData extends FieldValues = FieldValues,
  FormOutputData = never,
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
} & RvfSubmitOpts<FormOutputData>;

const isRvf = (form: any): form is Rvf<any> =>
  "__brand__" in form && form.__brand__ === "rvf";

/**
 * Create and use an `Rvf`.
 */
export function useRvf<FormInputData extends FieldValues, FormOutputData>(
  options: RvfOpts<FormInputData, FormOutputData>,
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
  const isWholeForm = isRvf(optsOrForm);
  const submitSource = isRvf(optsOrForm) ? undefined : optsOrForm.submitSource;
  const action = isRvf(optsOrForm) ? undefined : optsOrForm.action;
  const disableFocusOnError = isRvf(optsOrForm)
    ? undefined
    : optsOrForm.disableFocusOnError;
  const serverValidationErrors = isRvf(optsOrForm)
    ? undefined
    : optsOrForm.serverValidationErrors;

  const providedFormId = isRvf(optsOrForm) ? undefined : optsOrForm.formId;
  const defaultFormId = useId();

  const [form] = useState<Rvf<unknown>>(() => {
    if (isRvf(optsOrForm)) return optsOrForm;
    return createRvf({
      defaultValues:
        "defaultValues" in optsOrForm && optsOrForm.defaultValues
          ? optsOrForm.defaultValues
          : {},
      serverValidationErrors: serverValidationErrors ?? {},
      validator: optsOrForm.validator,
      onSubmit: optsOrForm.handleSubmit as never,
      validationBehaviorConfig: optsOrForm.validationBehaviorConfig,
      submitSource: optsOrForm.submitSource ?? "dom",
      formProps: {
        action,
        id: providedFormId ?? defaultFormId,
      },
      flags: {
        disableFocusOnError: disableFocusOnError ?? false,
      },
    });
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
    });
  }, [validator, onSubmit, isWholeForm, form.__store__.mutableImplStore]);

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
      },
      flags: {
        disableFocusOnError: disableFocusOnError ?? false,
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
  ]);

  useEffect(() => {
    if (isWholeForm || !serverValidationErrors) return;
    form.__store__.store
      .getState()
      .syncServerValidtionErrors(serverValidationErrors);
  }, [serverValidationErrors, form.__store__.store, isWholeForm]);

  return useRvfInternal(form) as never;
}
