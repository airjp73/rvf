import {
  useClearError,
  useDefaultValues,
  useFieldErrors,
  useHasBeenSubmitted,
  useIsSubmitting,
  useIsValid,
  useSetTouched,
  useTouchedFields,
  useValidatedFormAction,
  useValidateField,
} from "./hooks";
import { useContextSelectAtom, useInternalFormContext } from "./internal/hooks";
import { registerReceiveFocusAtom } from "./internal/state";
import { FieldErrors, TouchedFields } from "./validation/types";

export type DeprecatedFormContextValue = {
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
  validateField: (fieldName: string) => Promise<string | null>;
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

/**
 * @deprecated in favor of individual context selector hooks
 * This will be removed in a future major version.
 *
 * Exists for backwards compatibility from when React context
 * was the primary method of passing state around.
 */
export const useFormContext = (formId?: string): DeprecatedFormContextValue => {
  // Try to access context so we get our error specific to this hook if it's not there
  const context = useInternalFormContext(formId, "useFormContext");

  const action = useValidatedFormAction(formId);
  const isSubmitting = useIsSubmitting(formId);
  const hasBeenSubmitted = useHasBeenSubmitted(formId);
  const isValid = useIsValid(formId);
  const defaultValues = useDefaultValues(formId) as {
    [fieldName: string]: any;
  };
  const clearError = useClearError(formId);
  const fieldErrors = useFieldErrors(formId);
  const setFieldTouched = useSetTouched(formId);
  const touchedFields = useTouchedFields(formId);
  const validateField = useValidateField(formId);
  const registerReceiveFocus = useContextSelectAtom(
    context.formId,
    registerReceiveFocusAtom
  );
  return {
    isSubmitting,
    hasBeenSubmitted,
    isValid,
    defaultValues,
    clearError,
    fieldErrors,
    action,
    setFieldTouched,
    touchedFields,
    validateField,
    registerReceiveFocus,
  };
};
