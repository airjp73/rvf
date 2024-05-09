import {
  Rvf,
  ValidationBehaviorConfig,
  useField,
  useRvf,
  useRvfOrContext,
} from "@rvf/react";
import { useCallback, useMemo } from "react";

/**
 * Returns whether or not the parent form is currently being submitted.
 * This is different from Remix's `useNavigation()` in that it
 * is aware of what form it's in and when _that_ form is being submitted.
 *
 * Can optionally accept an `Rvf` to grab the data from that instead.
 *
 * @deprecated Provided for backwards compatibility with `remix-validated-form`.
 * You can instead get this data directly off of the `useRvf` hook.
 */
export const useIsSubmitting = (rvf?: Rvf<any>) =>
  useRvfOrContext(rvf).formState.isSubmitting;

/**
 * Returns whether or not the current form is valid.
 *
 * Can optionally accept an `Rvf` to grab the data from that instead.
 *
 * @deprecated Provided for backwards compatibility with `remix-validated-form`.
 * You can instead get this data directly off of the `useRvf` hook.
 */
export const useIsValid = (rvf?: Rvf<any>) =>
  useRvfOrContext(rvf).formState.isValid;

/**
 * @deprecated Can get the value and set the value directly off of the `useRvf` hook.
 */
export const useControlField = <T>(name: string, rvf?: Rvf<any>) => {
  const form = useRvfOrContext(rvf);
  const value: T = form.value(name);
  const setValue = useCallback(
    (value: T) => form.setValue(name, value),
    [form, name],
  );
  return [value, setValue] as const;
};

/**
 * @deprecated Can set the value directly off of the `useRvf` hook.
 */
export const useUpdateControlledField = (rvf?: Rvf<any>) => {
  const form = useRvfOrContext(rvf);
  return useCallback(
    (name: string, value: any) => form.setValue(name, value),
    [form],
  );
};

export type LegacyFieldProps = {
  /**
   * The validation error message if there is one.
   */
  error?: string;
  /**
   * Clears the error message.
   */
  clearError: () => void;
  /**
   * Validates the field.
   */
  validate: () => void;
  /**
   * The default value of the field, if there is one.
   */
  defaultValue?: any;
  /**
   * Whether or not the field has been touched.
   */
  touched: boolean;
  /**
   * Helper to set the touched state of the field.
   */
  setTouched: (touched: boolean) => void;
};

const defaultValidationBehavior: ValidationBehaviorConfig = {
  initial: "onBlur",
  whenTouched: "onChange",
  whenSubmitted: "onChange",
};

export type UseFieldLegacyOpts = {
  validationBehavior?: Partial<ValidationBehaviorConfig>;
};

/**
 * @deprecated Can switch to the newer version of `useField` instead.
 */
export function useFieldLegacy<FormInputData>(
  form: Rvf<FormInputData>,
  opts?: UseFieldLegacyOpts,
): LegacyFieldProps;

/**
 * @deprecated Can switch to the newer version of `useField` instead.
 */
export function useFieldLegacy(
  name: string,
  opts?: UseFieldLegacyOpts,
): LegacyFieldProps;

export function useFieldLegacy<FormInputData>(
  nameOrRvf: Rvf<FormInputData> | string,
  options?: UseFieldLegacyOpts,
): LegacyFieldProps {
  const field = useField<unknown>(nameOrRvf as string, {
    validationBehavior: {
      ...defaultValidationBehavior,
      ...options?.validationBehavior,
    },
  });

  return useMemo(
    (): LegacyFieldProps => ({
      error: field.error() ?? undefined,
      clearError: field.clearError,
      validate: field.validate,
      defaultValue: field.defaultValue(),
      touched: field.touched(),
      setTouched: field.setTouched,
    }),
    [field],
  );
}
