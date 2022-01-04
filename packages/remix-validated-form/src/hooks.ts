import get from "lodash/get";
import toPath from "lodash/toPath";
import { useContext, useEffect, useMemo } from "react";
import { FormContext } from "./internal/formContext";

export type FieldProps = {
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
};

/**
 * Provides the data and helpers necessary to set up a field.
 */
export const useField = (
  name: string,
  options?: {
    /**
     * Allows you to configure a custom function that will be called
     * when the input needs to receive focus due to a validation error.
     * This is useful for custom components that use a hidden input.
     */
    handleReceiveFocus?: () => void;
  }
): FieldProps => {
  const {
    fieldErrors,
    clearError,
    validateField,
    defaultValues,
    registerReceiveFocus,
  } = useContext(FormContext);

  const { handleReceiveFocus } = options ?? {};

  useEffect(() => {
    if (handleReceiveFocus)
      return registerReceiveFocus(name, handleReceiveFocus);
  }, [handleReceiveFocus, name, registerReceiveFocus]);

  const field = useMemo<FieldProps>(
    () => ({
      error: fieldErrors[name],
      clearError: () => {
        clearError(name);
      },
      validate: () => validateField(name),
      defaultValue: defaultValues
        ? get(defaultValues, toPath(name), undefined)
        : undefined,
    }),
    [clearError, defaultValues, fieldErrors, name, validateField]
  );

  return field;
};

/**
 * Provides access to the entire form context.
 * This is not usually necessary, but can be useful for advanced use cases.
 */
export const useFormContext = () => useContext(FormContext);

/**
 * Returns whether or not the parent form is currently being submitted.
 * This is different from remix's `useTransition().submission` in that it
 * is aware of what form it's in and when _that_ form is being submitted.
 */
export const useIsSubmitting = () => useFormContext().isSubmitting;
