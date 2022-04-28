import { useMemo } from "react";
import {} from "../internal/getInputProps";
import {
  useInternalFormContext,
  useClearError,
  useSetTouched,
  useDefaultValuesForForm,
  useFieldErrorsForForm,
  useSyncedFormProps,
  useInternalIsSubmitting,
  useInternalHasBeenSubmitted,
  useTouchedFields,
  useInternalIsValid,
  useFieldErrors,
} from "../internal/hooks";
import { FieldErrors, TouchedFields } from "../validation/types";

export type FormState = {
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
  hasBeenSubmitted: boolean;
  touchedFields: TouchedFields;
  defaultValues: { [fieldName: string]: any };
  action?: string;
  subaction?: string;
  isValid: boolean;
};

/**
 * Returns information about the form.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useFormState = (formId?: string): FormState => {
  const formContext = useInternalFormContext(formId, "useIsValid");
  const formProps = useSyncedFormProps(formContext.formId);
  const isSubmitting = useInternalIsSubmitting(formContext.formId);
  const hasBeenSubmitted = useInternalHasBeenSubmitted(formContext.formId);
  const touchedFields = useTouchedFields(formContext.formId);
  const isValid = useInternalIsValid(formContext.formId);

  const defaultValuesToUse = useDefaultValuesForForm(formContext);
  const hydratedDefaultValues = defaultValuesToUse.hydrateTo(
    formProps.defaultValues
  );

  const fieldErrorsFromState = useFieldErrors(formContext.formId);
  const fieldErrorsToUse = useFieldErrorsForForm(formContext);
  const hydratedFieldErrors = fieldErrorsToUse.hydrateTo(fieldErrorsFromState);

  return useMemo(
    () => ({
      ...formProps,
      defaultValues: hydratedDefaultValues,
      fieldErrors: hydratedFieldErrors ?? {},
      hasBeenSubmitted,
      isSubmitting,
      touchedFields,
      isValid,
    }),
    [
      formProps,
      hasBeenSubmitted,
      hydratedDefaultValues,
      hydratedFieldErrors,
      isSubmitting,
      isValid,
      touchedFields,
    ]
  );
};

export type FormHelpers = {
  /**
   * Clear the error of the specified field.
   */
  clearError: (fieldName: string) => void;
  /**
   * Validate the specified field.
   */
  validateField: (fieldName: string) => Promise<string | null>;
  /**
   * Change the touched state of the specified field.
   */
  setTouched: (fieldName: string, touched: boolean) => void;
};

/**
 * Returns helpers that can be used to update the form state.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useFormHelpers = (formId?: string): FormHelpers => {
  const formContext = useInternalFormContext(formId, "useFormHelpers");
  const setTouched = useSetTouched(formContext);
  const { validateField } = useSyncedFormProps(formContext.formId);
  const clearError = useClearError(formContext);
  return useMemo(
    () => ({
      setTouched,
      validateField,
      clearError,
    }),
    [clearError, setTouched, validateField]
  );
};
