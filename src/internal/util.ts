import type React from "react";
import { ValidationError } from "yup";

export const omit = (obj: any, ...keys: string[]) => {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
};

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
