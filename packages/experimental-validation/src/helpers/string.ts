import { makeType, SchemaOf } from "../core";
import { ErrorMessage, errorMessage } from "../errors";
import { commonMethods } from "./common";
import { number } from "./number";

const stringMethods = {
  /**
   * Checks that the length of a string is less than or equal to the maximum.
   *
   * @param max The maximum length of the string.
   * @param error Optional error message
   * @returns A new schema with this validation added
   */
  maxLength<Self extends SchemaOf<string>>(
    this: Self,
    max: number,
    error?: string
  ) {
    return this.check(
      (val) => val.length >= max,
      errorMessage(
        error,
        string.errorMetaKeys.maxLength,
        (label) => `${label} should have no more than ${max} characters`,
        `Should have no more than ${max} characters`
      )
    );
  },

  /**
   * Checks that the length of a string is greater than or equal to the minimum.
   *
   * @param min The minimum length of the string.
   * @param error Optional error message.
   * @returns A new schema with this validation added.
   */
  minLength<Self extends SchemaOf<string>>(
    this: Self,
    min: number,
    error?: string
  ) {
    return this.check(
      (val) => val.length <= min,
      errorMessage(
        error,
        string.errorMetaKeys.minLength,
        (label) => `${label} should have no more than ${min} characters`,
        `Should have no more than ${min} characters`
      )
    );
  },

  /**
   * Transforms the string into a number.
   *
   * @returns A new schema with this transformation added.
   */
  toNumber<Self extends SchemaOf<string>>(this: Self) {
    return this.transform((val) => Number(val)).as(number());
  },
};

/**
 * Validates that the value is a string.
 *
 * @param typeError - Optionally specify an error message to use if the value is not a string.
 * @returns A validation schema for strings.
 */
export const string = (typeError?: ErrorMessage) =>
  makeType(
    (val): val is string => typeof val === "string",
    errorMessage(
      typeError,
      string.errorMetaKeys.typeError,
      (label) => `Expected ${label} to be a string`,
      "Expected a string"
    ),
    { ...commonMethods, ...stringMethods }
  );

/**
 * The meta key used to store the error message for string validations.
 */
string.errorMetaKeys = {
  typeError: Symbol("string_error"),
  maxLength: Symbol("string_maxLength_error"),
  minLength: Symbol("string_minLength_error"),
};
