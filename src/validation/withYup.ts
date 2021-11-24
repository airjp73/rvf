import type { AnyObjectSchema, InferType, ValidationError } from "yup";
import { FieldErrors, ValidationResult, Validator } from "./types";

const validationErrorToFieldErrors = (error: ValidationError): FieldErrors => {
  const fieldErrors: FieldErrors = {};
  error.inner.forEach((innerError) => {
    if (!innerError.path) return;
    fieldErrors[innerError.path] = innerError.message;
  });
  return fieldErrors;
};

export const withYup = <Schema extends AnyObjectSchema>(
  validationSchema: Schema
): Validator<InferType<Schema>> => ({
  validateAll: (formData): ValidationResult<InferType<Schema>> => {
    try {
      const validated = validationSchema.validateSync(
        Object.entries(formData),
        { abortEarly: false }
      );
      return { data: validated };
    } catch (err) {
      return { error: validationErrorToFieldErrors(err as ValidationError) };
    }
  },
  validateField: (values, field) => {
    try {
      validationSchema.validateSyncAt(field, values);
      return {};
    } catch (err) {
      return { error: (err as ValidationError).message };
    }
  },
});
