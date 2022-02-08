import { useCallback } from "react";
import { useIsSubmitting, useIsValid } from "./hooks";
import {
  useClearError,
  useContextSelectAtom,
  useDefaultValuesForForm,
  useFieldErrorsForForm,
  useHydratableSelector,
  useInternalFormContext,
  useSetTouched,
} from "./internal/hooks";
import {
  actionAtom,
  defaultValuesAtom,
  fieldErrorsAtom,
  hasBeenSubmittedAtom,
  registerReceiveFocusAtom,
  touchedFieldsAtom,
  validateFieldAtom,
} from "./internal/state";
import { FieldErrors, TouchedFields } from "./validation/types";

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
 * Provides access to some of the internal state of the form.
 */
export const useFormContext = (formId?: string): FormContextValue => {
  // Try to access context so we get our error specific to this hook if it's not there
  const context = useInternalFormContext(formId, "useFormContext");

  const action = useContextSelectAtom(context.formId, actionAtom);
  const isSubmitting = useIsSubmitting(formId);
  const hasBeenSubmitted = useContextSelectAtom(
    context.formId,
    hasBeenSubmittedAtom
  );
  const isValid = useIsValid(formId);
  const defaultValues = useHydratableSelector(
    context,
    defaultValuesAtom,
    useDefaultValuesForForm(context)
  );
  const fieldErrors = useHydratableSelector(
    context,
    fieldErrorsAtom,
    useFieldErrorsForForm(context)
  );

  const setFieldTouched = useSetTouched(context);
  const touchedFields = useContextSelectAtom(context.formId, touchedFieldsAtom);
  const validateField = useContextSelectAtom(context.formId, validateFieldAtom);
  const registerReceiveFocus = useContextSelectAtom(
    context.formId,
    registerReceiveFocusAtom
  );

  const internalClearError = useClearError(context);
  const clearError = useCallback(
    (...names: string[]) => {
      names.forEach((name) => {
        internalClearError(name);
      });
    },
    [internalClearError]
  );

  return {
    isSubmitting,
    hasBeenSubmitted,
    isValid,
    defaultValues,
    clearError,
    fieldErrors: fieldErrors ?? {},
    action,
    setFieldTouched,
    touchedFields,
    validateField,
    registerReceiveFocus,
  };
};
