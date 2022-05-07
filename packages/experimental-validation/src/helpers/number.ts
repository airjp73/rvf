import { check, transform, typecheck } from "../core";
import { ErrorMessage, errorMessage } from "../errors";

/**
 * Checks if the value is a number.
 *
 * @param typeError - Optionally specify an error message to use in this case.
 * @returns A validation pipeline that checks if the value is a number.
 */
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

/**
 * The meta key used to store the error message for this validation.
 */
number.ERROR = Symbol("number_error");

/**
 * Checks if a number is less than or equal to the maximum.
 *
 * @param maximum - The maximum value.
 * @param error - Optionally specify an error message to use in this case.
 * @returns A validation pipeline that checks if a number is less than or equal to the maximum.
 */
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

/**
 * The meta key used to store the error message for this validation.
 */
max.ERROR = Symbol("number_max_error");

/**
 * Checks if a number is greater than or equal to the minimum.
 *
 * @param minimum - The minimum value.
 * @param error - Optionally specify an error message to use in this case.
 * @returns A validation pipeline that checks if a number is greater than or equal to the minimum.
 */
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

/**
 * The meta key used to store the error message for this validation.
 */
min.ERROR = Symbol("number_min_error");

/**
 * Transforms a number to a string.
 *
 * @returns A validation pipeline that transforms a number to a string.
 */
export const toString = () => transform<number, string>((val) => String(val));
