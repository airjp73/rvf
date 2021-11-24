import { json } from "@remix-run/server-runtime";
import type React from "react";
import type { AnyObjectSchema } from "yup";
import { ValidationError } from "yup";

export const omit = (obj: any, ...keys: string[]) => {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
};

// Might not need this
export const mergeRefs = <T = any>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T> | undefined>
): React.RefCallback<T> => {
  return (value: T) => {
    refs.filter(Boolean).forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
};

export type ValidationResultType<T> = T | ValidationError;

export const validateRequestParams = async <T extends AnyObjectSchema>(
  formData: FormData,
  schema: T
): Promise<ValidationResultType<ReturnType<T["validateSync"]>>> => {
  const rawParams = Object.entries(formData);
  try {
    return await schema.validate(rawParams, { abortEarly: false });
  } catch (err) {
    if (err instanceof ValidationError) return err;
    throw err;
  }
};

export const validationErrorToFieldErrors = (
  error: ValidationError
): Record<string, ValidationError> => {
  const fieldErrors: Record<string, ValidationError> = {};
  error.inner.forEach((innerError) => {
    if (!innerError.path) return;
    fieldErrors[innerError.path] = innerError;
  });
  return fieldErrors;
};

export const fieldErrors = (err: ValidationError) =>
  json({ fieldErrors: validationErrorToFieldErrors(err) }, { status: 422 });
