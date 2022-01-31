import { createValidator, FieldErrors, Validator } from "remix-validated-form";
import type { AnyObjectSchema, InferType, ValidationError } from "yup";

const validationErrorToFieldErrors = (error: ValidationError): FieldErrors => {
  const fieldErrors: FieldErrors = {};
  error.inner.forEach((innerError) => {
    if (!innerError.path) return;
    fieldErrors[innerError.path] = innerError.message;
  });
  return fieldErrors;
};

/**
 * Create a `Validator` using a `yup` schema.
 */
export const withYup = <Schema extends AnyObjectSchema>(
  validationSchema: Schema
): Validator<InferType<Schema>> => {
  return createValidator({
    validate: async (data) => {
      try {
        const validated = await validationSchema.validate(data, {
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
    validateField: async (data, field) => {
      try {
        await validationSchema.validateAt(field, data);
        return {};
      } catch (err) {
        return { error: (err as ValidationError).message };
      }
    },
  });
};
