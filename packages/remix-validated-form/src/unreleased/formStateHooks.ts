import { useMemo } from "react";
import {} from "../internal/getInputProps";
import {
  useInternalFormContext,
  useClearError,
  useSetTouched,
  useDefaultValuesForForm,
  useFieldErrorsForForm,
  useFormAtomValue,
} from "../internal/hooks";
import {
  fieldErrorsAtom,
  formPropsAtom,
  hasBeenSubmittedAtom,
  isSubmittingAtom,
  isValidAtom,
  touchedFieldsAtom,
} from "../internal/state";
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
  const formProps = useFormAtomValue(formPropsAtom(formContext.formId));
  const isSubmitting = useFormAtomValue(isSubmittingAtom(formContext.formId));
  const hasBeenSubmitted = useFormAtomValue(
    hasBeenSubmittedAtom(formContext.formId)
  );
  const touchedFields = useFormAtomValue(touchedFieldsAtom(formContext.formId));
  const isValid = useFormAtomValue(isValidAtom(formContext.formId));

  const defaultValuesToUse = useDefaultValuesForForm(formContext);
  const hydratedDefaultValues = defaultValuesToUse.hydrateTo(
    formProps.defaultValues
  );

  const fieldErrorsFromState = useFormAtomValue(
    fieldErrorsAtom(formContext.formId)
  );
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
  const { validateField } = useFormAtomValue(formPropsAtom(formContext.formId));
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
