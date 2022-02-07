import { useCallback, useEffect, useMemo } from "react";
import {
  createGetInputProps,
  GetInputProps,
  ValidationBehaviorOptions,
} from "./internal/getInputProps";
import {
  useUnknownFormContextSelectAtom,
  useDefaultValuesForForm,
  useInternalFormContext,
  useFormUpdateAtom,
  useFieldTouched,
  useFieldError,
  useFieldDefaultValue,
  useFieldErrorsForForm,
  useHydratableSelector,
  useContextSelectAtom,
} from "./internal/hooks";
import {
  actionAtom,
  clearErrorAtom,
  defaultValuesAtom,
  fieldErrorsAtom,
  formRegistry,
  hasBeenSubmittedAtom,
  isSubmittingAtom,
  isValidAtom,
  registerReceiveFocusAtom,
  setTouchedAtom,
  touchedFieldsAtom,
  validateFieldAtom,
} from "./internal/state";

/**
 * Returns whether or not the parent form is currently being submitted.
 * This is different from remix's `useTransition().submission` in that it
 * is aware of what form it's in and when _that_ form is being submitted.
 *
 * @param formId
 */
export const useIsSubmitting = (formId?: string) =>
  useUnknownFormContextSelectAtom(formId, isSubmittingAtom, "useIsSubmitting");

/**
 * Returns whether or not a submit has been attempted.
 * This will be `true` after the first submit attempt, even if the form is invalid.
 * This resets when the form resets.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useHasBeenSubmitted = (formId?: string) =>
  useUnknownFormContextSelectAtom(
    formId,
    hasBeenSubmittedAtom,
    "useHasBeenSubmitted"
  );

/**
 * Returns an object containing all the touched fields.
 * The keys of the object are the field names and values are whether or not the field has been touched.
 * If a field has not been touched at all, the value will be `undefined`.
 * If you set touched to `false` manually, then the value will be `false`.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useTouchedFields = (formId?: string) =>
  useUnknownFormContextSelectAtom(
    formId,
    touchedFieldsAtom,
    "useTouchedFields"
  );

/**
 * Returns a function that performs validation on the specified field
 * and populates the field errors if there's an error.
 * Also returns the error message if there is one.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useValidateField = (formId?: string) =>
  useUnknownFormContextSelectAtom(
    formId,
    validateFieldAtom,
    "useValidateField"
  );

/**
 * Returns whether or not the current form is valid.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useIsValid = (formId?: string) =>
  useUnknownFormContextSelectAtom(formId, isValidAtom, "useIsValid");

/**
 * Returns a function that clears the errors from all the specified fields.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useClearError = (formId?: string) => {
  const formContext = useInternalFormContext(formId, "useClearError");
  const clearError = useFormUpdateAtom(clearErrorAtom);
  return useCallback(
    (...names: string[]) => {
      names.forEach((name) => {
        clearError({ name, formAtom: formRegistry(formContext.formId) });
      });
    },
    [clearError, formContext.formId]
  );
};

/**
 * Returns a function that can be used to manually set the `touced` state of a field.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useSetTouched = (formId?: string) => {
  const formContext = useInternalFormContext(formId, "useSetFieldTouched");
  const setTouched = useFormUpdateAtom(setTouchedAtom);
  return useCallback(
    (name: string, touched: boolean) => {
      setTouched({ name, formAtom: formRegistry(formContext.formId), touched });
    },
    [setTouched, formContext.formId]
  );
};

/**
 * Returns the field errors for the whole form.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useFieldErrors = (formId?: string) => {
  const context = useInternalFormContext(formId, "useFieldErrors");
  return (
    useHydratableSelector(
      context,
      fieldErrorsAtom,
      useFieldErrorsForForm(context)
    ) ?? {}
  );
};

/**
 * Returns the default values of the form.
 *
 * @param formId the id of the form. Only necessary if being used outside a ValidatedForm.
 */
export const useDefaultValues = (formId?: string) => {
  const context = useInternalFormContext(formId, "useDefaultValues");
  return useHydratableSelector(
    context,
    defaultValuesAtom,
    useDefaultValuesForForm(context)
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
  const { handleReceiveFocus, formId: providedFormId } = options ?? {};
  const formContext = useInternalFormContext(providedFormId, "useField");

  const defaultValue = useFieldDefaultValue(name, formContext);
  const touched = useFieldTouched(name, formContext);
  const error = useFieldError(name, formContext);

  const clearError = useClearError(providedFormId);
  const setTouched = useSetTouched(providedFormId);
  const hasBeenSubmitted = useHasBeenSubmitted(providedFormId);
  const validateField = useValidateField(providedFormId);
  const registerReceiveFocus = useContextSelectAtom(
    formContext.formId,
    registerReceiveFocusAtom
  );

  useEffect(() => {
    if (handleReceiveFocus)
      return registerReceiveFocus(name, handleReceiveFocus);
  }, [handleReceiveFocus, name, registerReceiveFocus]);

  const field = useMemo<FieldProps>(() => {
    const helpers = {
      error,
      clearError: () => clearError(name),
      validate: () => {
        validateField(name);
      },
      defaultValue,
      touched,
      setTouched: (touched: boolean) => setTouched(name, touched),
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
    name,
    hasBeenSubmitted,
    options?.validationBehavior,
    clearError,
    validateField,
    setTouched,
  ]);

  return field;
};
