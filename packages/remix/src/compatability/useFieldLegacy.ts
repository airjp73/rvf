import { Rvf, ValidationBehaviorConfig, useField } from "@rvf/react";
import { useMemo } from "react";

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
