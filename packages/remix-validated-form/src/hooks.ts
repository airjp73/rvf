import get from "lodash/get";
import toPath from "lodash/toPath";
import { useContext, useEffect, useMemo } from "react";
import { FormContext } from "./internal/formContext";
import {
  createGetInputProps,
  GetInputProps,
  ValidationBehaviorOptions,
} from "./internal/getInputProps";

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
  /**
   * Whether or not the field has been touched.
   */
  touched: boolean;
  /**
   * Helper to set the touched state of the field.
   */
  setTouched: (touched: boolean) => void;
  /**
   * Helper to get all the props necessary for a regular input.
   */
  getInputProps: GetInputProps;
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
    /**
     * Allows you to specify when a field gets validated (when using getInputProps)
     */
    validationBehavior?: Partial<ValidationBehaviorOptions>;
  }
): FieldProps => {
  const {
    fieldErrors,
    clearError,
    validateField,
    defaultValues,
    registerReceiveFocus,
    touchedFields,
    setFieldTouched,
    hasBeenSubmitted,
  } = useContext(FormContext);

  const isTouched = touchedFields[name];
  const { handleReceiveFocus } = options ?? {};

  useEffect(() => {
    if (handleReceiveFocus)
      return registerReceiveFocus(name, handleReceiveFocus);
  }, [handleReceiveFocus, name, registerReceiveFocus]);

  const field = useMemo<FieldProps>(() => {
    const helpers = {
      error: fieldErrors[name],
      clearError: () => {
        clearError(name);
      },
      validate: () => validateField(name),
      defaultValue: defaultValues
        ? get(defaultValues, toPath(name), undefined)
        : undefined,
      touched: isTouched,
      setTouched: (touched: boolean) => setFieldTouched(name, touched),
    };
    const getInputProps = createGetInputProps({
      ...helpers,
      name,
      hasBeenSubmitted,
      validationBehavior: options?.validationBehavior,
    });
    return {
      ...helpers,
      getInputProps,
    };
  }, [
    fieldErrors,
    name,
    defaultValues,
    isTouched,
    hasBeenSubmitted,
    options?.validationBehavior,
    clearError,
    validateField,
    setFieldTouched,
  ]);

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
