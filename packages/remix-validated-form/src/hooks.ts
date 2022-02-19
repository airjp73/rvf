import { useEffect, useMemo } from "react";
import {
  createGetInputProps,
  GetInputProps,
  ValidationBehaviorOptions,
} from "./internal/getInputProps";
import {
  useInternalFormContext,
  useFieldTouched,
  useFieldError,
  useFieldDefaultValue,
  useClearError,
  useSetTouched,
  useDefaultValuesForForm,
  useFieldErrorsForForm,
  useFormAtomValue,
} from "./internal/hooks";
import {
  fieldErrorsAtom,
  formPropsAtom,
  hasBeenSubmittedAtom,
  isSubmittingAtom,
  isValidAtom,
  touchedFieldsAtom,
} from "./internal/state";
import { FieldErrors, TouchedFields } from ".";

/**
 * Returns whether or not the parent form is currently being submitted.
 * This is different from remix's `useTransition().submission` in that it
 * is aware of what form it's in and when _that_ form is being submitted.
 *
 * @param formId
 */
export const useIsSubmitting = (formId?: string) => {
  const formContext = useInternalFormContext(formId, "useIsSubmitting");
  return useFormAtomValue(isSubmittingAtom(formContext.formId));
};

/**
 * Returns whether or not the current form is valid.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useIsValid = (formId?: string) => {
  const formContext = useInternalFormContext(formId, "useIsValid");
  return useFormAtomValue(isValidAtom(formContext.formId));
};

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
    /**
     * The formId of the form you want to use.
     * This is not necesary if the input is used inside a form.
     */
    formId?: string;
  }
): FieldProps => {
  const { formId: providedFormId, handleReceiveFocus } = options ?? {};
  const formContext = useInternalFormContext(providedFormId, "useField");

  const defaultValue = useFieldDefaultValue(name, formContext);
  const [touched, setTouched] = useFieldTouched(name, formContext);
  const [error, setError] = useFieldError(name, formContext);

  const hasBeenSubmitted = useFormAtomValue(
    hasBeenSubmittedAtom(formContext.formId)
  );
  const { validateField, registerReceiveFocus } = useFormAtomValue(
    formPropsAtom(formContext.formId)
  );

  useEffect(() => {
    if (handleReceiveFocus)
      return registerReceiveFocus(name, handleReceiveFocus);
  }, [handleReceiveFocus, name, registerReceiveFocus]);

  const field = useMemo<FieldProps>(() => {
    const helpers = {
      error,
      clearError: () => setError(undefined),
      validate: () => {
        validateField(name);
      },
      defaultValue,
      touched,
      setTouched,
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
    error,
    defaultValue,
    touched,
    setTouched,
    name,
    hasBeenSubmitted,
    options?.validationBehavior,
    setError,
    validateField,
  ]);

  return field;
};
