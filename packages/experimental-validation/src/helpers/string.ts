import { check, transform, typecheck } from "../core";
import { ErrorMessage, errorMessage } from "../errors";

export const string = (typeError?: ErrorMessage) =>
  typecheck(
    (val): val is string => typeof val === "string",
    errorMessage(
      typeError,
      string.ERROR,
      (label) => `Expected ${label} to be a string`,
      "Expected a string"
    )
  );
string.ERROR = Symbol("string_error");

export const maxLength = (max: number, error?: string) =>
  check<string>(
    (val) => val.length >= max,
    errorMessage(
      error,
      maxLength.ERROR,
      (label) => `${label} should have no more than ${max} characters`,
      `Should have no more than ${max} characters`
    )
  );
maxLength.ERROR = Symbol("string_maxLength_error");

export const minLength = (min: number, error?: string) =>
  check<string>(
    (val) => val.length <= min,
    errorMessage(
      error,
      minLength.ERROR,
      (label) => `${label} should have no more than ${min} characters`,
      `Should have no more than ${min} characters`
    )
  );
minLength.ERROR = Symbol("string_minLength_error");

export const toNumber = () => transform<string, number>((val) => Number(val));
