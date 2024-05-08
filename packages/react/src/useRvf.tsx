import {
  ChangeEvent,
  ReactNode,
  RefCallback,
  useEffect,
  useState,
} from "react";
import {
  FieldValues,
  ValidationBehaviorConfig,
  Validator,
  Rvf,
  createRvf,
} from "@rvf/core";
import { RvfReact, useRvfInternal } from "./base";

export type FieldProps<Value> = {
  defaultValue: Value;
  onChange: (eventOrValue?: ChangeEvent<any> | Value) => void;
  onBlur: () => void;
  ref: RefCallback<HTMLElement>;
};

export type ControlProps<Value> = {
  value: Value;
  onChange: (eventOrValue?: ChangeEvent<any> | Value) => void;
  onBlur: () => void;
  ref: RefCallback<HTMLElement>;
};

export type CheckboxProps = {
  checked: boolean;
  onChange: (eventOrValue?: ChangeEvent<any> | boolean) => void;
  onBlur: () => void;
  ref: RefCallback<HTMLElement>;
};

export type RvfOpts<FormInputData extends FieldValues, FormOutputData> = {
  /**
   * The initial values of the form.
   * It's recommended that you provide a default value for every field in the form.
   */
  defaultValues: FormInputData;

  /**
   * A function that validates the form's values.
   * This is most commonly used in combination with an adapter for a particular validation library like `zod`.
   */
  validator: Validator<FormInputData, FormOutputData>;

  /**
   * Handles the submission of the form.
   * This will be called when the form is submitted.
   */
  onSubmit: NoInfer<(data: FormOutputData) => Promise<void>>;

  /**
   * Allows you to customize the validation behavior of the form.
   */
  validationBehaviorConfig?: ValidationBehaviorConfig;
};

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

export function useRvf<FormInputData extends FieldValues, FormOutputData>(
  optsOrForm: RvfOpts<FormInputData, FormOutputData> | Rvf<FormInputData>,
): RvfReact<FormInputData> {
  const [form] = useState<Rvf<FormInputData>>(() => {
    if ("__brand__" in optsOrForm) return optsOrForm;
    return createRvf({
      defaultValues: optsOrForm.defaultValues,
      validator: optsOrForm.validator,
      onSubmit: optsOrForm.onSubmit,
      validationBehaviorConfig: optsOrForm.validationBehaviorConfig,
    });
  });

  const validator = isRvf(optsOrForm) ? undefined : optsOrForm.validator;
  const onSubmit = isRvf(optsOrForm) ? undefined : optsOrForm.onSubmit;
  const isWholeForm = isRvf(optsOrForm);

  useEffect(() => {
    if (isWholeForm) return;

    Object.assign(form.__store__.mutableImplStore, {
      validator: validator as any,
      onSubmit,
    });
  }, [validator, onSubmit, isWholeForm, form.__store__.mutableImplStore]);

  return useRvfInternal(form);
}
