import { json } from "@remix-run/server-runtime";
import type { AnyObjectSchema, InferType } from "yup";
import { ValidationError } from "yup";
import { validationErrorToFieldErrors } from "./internal/util";

export type ValidationResultType<T> = { data: T } | { error: ValidationError };

export const validateFormData = async <T extends AnyObjectSchema>(
  formData: FormData,
  schema: T
): Promise<ValidationResultType<InferType<T>>> => {
  const rawParams = Object.entries(formData);
  try {
    return {
      data: await schema.validate(rawParams, { abortEarly: false }),
    };
  } catch (err) {
    if (err instanceof ValidationError) return { error: err };
    throw err;
  }
};

export const fieldErrors = (err: ValidationError) =>
  json({ fieldErrors: validationErrorToFieldErrors(err) }, { status: 422 });
