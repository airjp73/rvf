import { useEffect, useState, useId } from "react";
import {
  FieldValues,
  ValidationBehaviorConfig,
  Validator,
  Rvf,
  createRvf,
} from "@rvf/core";
import { RvfReact, useRvfInternal } from "./base";

type SubmitTypes<FormOutputData> =
  | {
      submitSource?: "state";
      handleSubmit: (data: FormOutputData) => Promise<void>;
    }
  | {
      submitSource: "dom";
      handleSubmit: (data: FormOutputData, formData: FormData) => Promise<void>;
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
} & SubmitTypes<FormOutputData>;

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
  const providedFormId = isRvf(optsOrForm) ? undefined : optsOrForm.formId;

  const defaultFormId = useId();

  const [form] = useState<Rvf<unknown>>(() => {
    if ("__brand__" in optsOrForm) return optsOrForm;
    return createRvf({
      defaultValues:
        "defaultValues" in optsOrForm && optsOrForm.defaultValues
          ? optsOrForm.defaultValues
          : {},
      validator: optsOrForm.validator,
      onSubmit: optsOrForm.handleSubmit as never,
      validationBehaviorConfig: optsOrForm.validationBehaviorConfig,
      submitSource: optsOrForm.submitSource ?? "state",
      formProps: {
        action,
        id: providedFormId ?? defaultFormId,
      },
    });
  });

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
      submitSource: submitSource ?? "state",
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
  ]);

  return useRvfInternal(form) as never;
}
