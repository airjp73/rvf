import { createContext, useContext, useMemo } from "react";
import type * as yup from "yup";

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
