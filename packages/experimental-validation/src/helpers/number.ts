import { makeType, SchemaOf } from "../core";
import { ErrorMessage, errorMessage } from "../errors";
import { commonMethods } from "./common";
import { string } from "./string";

const numberMethods = {
  /**
   * Checks if a number is less than or equal to the maximum.
   *
   * @param maximum - The maximum value.
   * @param error - Optionally specify an error message to use in this case.
   * @returns A new schema with this validation added.
   */
  max<Self extends SchemaOf<number>>(
    this: Self,
    maximum: number,
    error?: ErrorMessage
  ) {
    return this.check(
      (val) => val <= maximum,
      errorMessage(
        error,
        number.errorMetaKeys.max,
        (label) => `${label} should be no more than ${maximum}`,
        `Should be no more than ${maximum}`
      )
    );
  },

  /**
   * Checks if a number is greater than or equal to the minimum.
   *
   * @param minimum - The minimum value.
   * @param error - Optionally specify an error message to use in this case.
   * @returns A validation pipeline that checks if a number is greater than or equal to the minimum.
   */
  min<Self extends SchemaOf<number>>(
    this: Self,
    minimum: number,
    error?: ErrorMessage
  ) {
    return this.check(
      (val) => val >= minimum,
      errorMessage(
        error,
        number.errorMetaKeys.min,
        (label) => `${label} should be at least ${minimum}`,
        `Should be at least ${minimum}`
      )
    );
  },

  /**
   * Transforms a the validated number to a string.
   *
   * @returns A new schema that transforms a number to a string.
   */
  toString<Self extends SchemaOf<number>>(this: Self) {
    return this.transform((val) => String(val)).as(string());
  },
};

/**
 * Validates that the value is a number.
 *
 * @param typeError - Optionally specify an error message to use if the value is not a number.
 * @returns A validation schema for numbers.
 */
export const number = (typeError?: ErrorMessage) =>
  makeType(
    (val): val is number => typeof val === "number",
    errorMessage(
      typeError,
      number.errorMetaKeys.typeError,
      (label) => `Expected ${label} to be a number`,
      "Expected a number"
    ),
    { ...commonMethods, ...numberMethods }
  );

/**
 * The meta key used to store the error message for number validations..
 */
number.errorMetaKeys = {
  typeError: Symbol("number_error"),
  max: Symbol("number_max_error"),
  min: Symbol("number_min_error"),
};
