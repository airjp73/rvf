import { createContext } from "react";
import { FieldErrors } from "../validation/types";

export type FormContextValue = {
  fieldErrors: FieldErrors;
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
