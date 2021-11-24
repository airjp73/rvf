import { useContext, useMemo } from "react";
import { FormContext } from "./internal/formContext";

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

export const useIsSubmitting = () => useFormContext().isSubmitting;
