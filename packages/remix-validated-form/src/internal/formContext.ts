import { createContext } from "react";
import { FieldErrors, TouchedFields } from "../validation/types";

export type FormContextValue = {
  /**
   * All the errors in all the fields in the form.
   */
  fieldErrors: FieldErrors;
  /**
   * Clear the errors of the specified fields.
   */
  clearError: (...names: string[]) => void;
  /**
   * Validate the specified field.
   */
  validateField: (fieldName: string) => Promise<void>;
  /**
   * The `action` prop of the form.
   */
  action?: string;
  /**
   * Whether or not the form is submitting.
   */
  isSubmitting: boolean;
  /**
   * Whether or not a submission has been attempted.
   * This is true once the form has been submitted, even if there were validation errors.
   * Resets to false when the form is reset.
   */
  hasBeenSubmitted: boolean;
  /**
   * Whether or not the form is valid.
   * This is a shortcut for `Object.keys(fieldErrors).length === 0`.
   */
  isValid: boolean;
  /**
   * The default values of the form.
   */
  defaultValues?: { [fieldName: string]: any };
  /**
   * Register a custom focus handler to be used when
   * the field needs to receive focus due to a validation error.
   */
  registerReceiveFocus: (fieldName: string, handler: () => void) => () => void;
  /**
   * Any fields that have been touched by the user.
   */
  touchedFields: TouchedFields;
  /**
   * Change the touched state of the specified field.
   */
  setFieldTouched: (fieldName: string, touched: boolean) => void;
};

export const FormContext = createContext<FormContextValue>({
  fieldErrors: {},
  clearError: () => {},
  validateField: async () => await new Promise((res) => res()),
  isSubmitting: false,
  hasBeenSubmitted: false,
  isValid: true,
  registerReceiveFocus: () => () => {},
  touchedFields: {},
  setFieldTouched: () => {},
});
