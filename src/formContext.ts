import { createContext, useContext, useMemo } from "react";
import * as yup from "yup";

export type FormContextValue = {
  fieldErrors: {
    [fieldName: string]: yup.ValidationError;
  };
  clearError: (...names: string[]) => void;
  validateField: (fieldName: string) => void;
  action?: string;
  isSubmitting: boolean;
  defaultValues?: { [fieldName: string]: any };
};
export const FormContext = createContext<FormContextValue>({
  fieldErrors: {},
  clearError: () => {},
  validateField: () => {},
  isSubmitting: false,
});

export const useField = (name: string) => {
  const { fieldErrors, clearError, validateField, defaultValues } =
    useContext(FormContext);

  const field = useMemo(
    () => ({
      error: fieldErrors[name],
      clearError: () => {
        clearError(name);
      },
      validate: () => validateField(name),
      defaultValue: defaultValues?.[name],
    }),
    [clearError, defaultValues, fieldErrors, name, validateField]
  );

  return field;
};

export const useFormContext = () => useContext(FormContext);
