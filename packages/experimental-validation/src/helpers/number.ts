import { check, transform, typecheck } from "../core";
import { ErrorMessage, errorMessage } from "../errors";

export const number = (typeError?: ErrorMessage) =>
  typecheck(
    (val): val is number => typeof val === "number",
    errorMessage(
      typeError,
      number.ERROR,
      (label) => `Expected ${label} to be a number`,
      "Expected a number"
    )
  );
number.ERROR = Symbol("number_error");

export const max = (maximum: number, error?: ErrorMessage) =>
  check<number>(
    (val) => val <= maximum,
    errorMessage(
      error,
      max.ERROR,
      (label) => `${label} should be no more than ${maximum}`,
      `Should be no more than ${maximum}`
    )
  );
max.ERROR = Symbol("number_max_error");

export const min = (minimum: number, error?: ErrorMessage) =>
  check<number>(
    (val) => val >= minimum,
    errorMessage(
      error,
      min.ERROR,
      (label) => `${label} should be at least ${minimum}`,
      `Should be at least ${minimum}`
    )
  );
min.ERROR = Symbol("number_min_error");

export const toString = () => transform<number, string>((val) => String(val));
