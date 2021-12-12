import type { AnyObjectSchema, InferType, ValidationError } from "yup";
import { createValidator } from "./createValidator";
import { FieldErrors, Validator } from "./types";

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
): Validator<InferType<Schema>> => {
  return createValidator({
    validate: (data) => {
      try {
        const validated = validationSchema.validateSync(data, {
          abortEarly: false,
        });
        return { data: validated, error: undefined };
      } catch (err) {
        return {
          error: validationErrorToFieldErrors(err as ValidationError),
          data: undefined,
        };
      }
    },
    validateField: (data, field) => {
      try {
        validationSchema.validateSyncAt(field, data);
        return {};
      } catch (err) {
        return { error: (err as ValidationError).message };
      }
    },
  });
};
