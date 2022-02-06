import get from "lodash/get";
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
  useErrorResponseForForm,
  useContextSelectAtom,
  useFieldInfo,
  useFormUpdateAtom,
} from "./internal/hooks";
import {
  actionAtom,
  clearErrorAtom,
  fieldErrorsAtom,
  formRegistry,
  hasBeenSubmittedAtom,
  isHydratedAtom,
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
 */
export const useIsSubmitting = (formId?: string) =>
  useUnknownFormContextSelectAtom(formId, isSubmittingAtom, "useIsSubmitting");

export const useHasBeenSubmitted = (formId?: string) =>
  useUnknownFormContextSelectAtom(
    formId,
    hasBeenSubmittedAtom,
    "useHasBeenSubmitted"
  );

export const useValidatedFormAction = (formId?: string) =>
  useUnknownFormContextSelectAtom(formId, actionAtom, "useValidatedFormAction");

export const useTouchedFields = (formId?: string) =>
  useUnknownFormContextSelectAtom(
    formId,
    touchedFieldsAtom,
    "useTouchedFields"
  );

export const useRegisterReceiveFocus = (formId?: string) =>
  useUnknownFormContextSelectAtom(
    formId,
    registerReceiveFocusAtom,
    "useRegisterReceiveFocus"
  );

export const useValidateField = (formId?: string) =>
  useUnknownFormContextSelectAtom(
    formId,
    validateFieldAtom,
    "useRegisterReceiveFocus"
  );

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

export const useSetFieldTouched = (formId?: string) => {
  const formContext = useInternalFormContext(formId, "useSetFieldTouched");
  const clearError = useFormUpdateAtom(setTouchedAtom);
  return useCallback(
    (name: string, touched: boolean) => {
      clearError({ name, formAtom: formRegistry(formContext.formId), touched });
    },
    [clearError, formContext.formId]
  );
};

export const useFieldErrors = (formId?: string) => {
  const context = useInternalFormContext(formId, "useField");
  const fieldErrors = useContextSelectAtom(context.formId, fieldErrorsAtom);
  const hydrated = useContextSelectAtom(context.formId, isHydratedAtom);
  const errorResponse = useErrorResponseForForm(context);
  const error = hydrated ? fieldErrors : errorResponse?.fieldErrors;
  return error ?? {};
};

/**
 * Returns whether or not the current form is valid.
 */
export const useIsValid = (formId?: string) =>
  useUnknownFormContextSelectAtom(formId, isValidAtom, "useIsValid");

export const useDefaultValues = (formId?: string) => {
  const formContext = useInternalFormContext(formId, "useDefaultValues");
  return useDefaultValuesForForm(formId ? { formId } : formContext);
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
  const { formId } = formContext;
  const formAtom = formRegistry(formId);
  const hydrated = useContextSelectAtom(formId, isHydratedAtom);

  const defaultValues = useDefaultValuesForForm(formContext);
  const defaultValue = get(defaultValues, name);

  const { touched, error: errorFromState } = useFieldInfo(name, formAtom);

  const errorResponse = useErrorResponseForForm(formContext);
  const error = hydrated
    ? errorFromState
    : errorResponse?.fieldErrors && get(errorResponse?.fieldErrors, name);

  const clearError = useFormUpdateAtom(clearErrorAtom);
  const setTouched = useFormUpdateAtom(setTouchedAtom);
  const hasBeenSubmitted = useHasBeenSubmitted(providedFormId);
  const validateField = useContextSelectAtom(formId, validateFieldAtom);
  const registerReceiveFocus = useContextSelectAtom(
    formId,
    registerReceiveFocusAtom
  );

  useEffect(() => {
    if (handleReceiveFocus)
      return registerReceiveFocus(name, handleReceiveFocus);
  }, [handleReceiveFocus, name, registerReceiveFocus]);

  const field = useMemo<FieldProps>(() => {
    const helpers = {
      error,
      clearError: () => clearError({ name, formAtom }),
      validate: () => {
        validateField(name);
      },
      defaultValue,
      touched,
      setTouched: (touched: boolean) => setTouched({ name, formAtom, touched }),
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
    formAtom,
    validateField,
    setTouched,
  ]);

  return field;
};
