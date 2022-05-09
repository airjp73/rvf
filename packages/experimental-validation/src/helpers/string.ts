import { AnySchema, makeType } from "../core";
import { ErrorMessage, errorMessage } from "../errors";

//////// Methods
const stringMethods = {
  /**
   * Checks that the length of a string is less than or equal to the maximum.
   * @param max The maximum length of the string.
   * @param error Optional error message
   * @returns A new schema with this validation added
   */
  maxLength<Self extends AnySchema>(this: Self, max: number, error?: string) {
    return this.check(
      (val) => val.length >= max,
      errorMessage(
        error,
        string.ERRORS.MAX_LENGTH_ERROR,
        (label) => `${label} should have no more than ${max} characters`,
        `Should have no more than ${max} characters`
      )
    );
  },

  /**
   * Checks that the length of a string is greater than or equal to the minimum.
   * @param min The minimum length of the string.
   * @param error Optional error message.
   * @returns A new schema with this validation added.
   */
  minLength<Self extends AnySchema>(this: Self, min: number, error?: string) {
    return this.check(
      (val) => val.length <= min,
      errorMessage(
        error,
        string.ERRORS.MIN_LENGTH_ERROR,
        (label) => `${label} should have no more than ${min} characters`,
        `Should have no more than ${min} characters`
      )
    );
  },

  /**
   * Transforms the string into a number.
   * @returns A new schema with this transformation added.
   */
  toNumber<Self extends AnySchema>(this: Self) {
    return this.transform((val) => Number(val));
  },
};

export const string = (typeError?: ErrorMessage) =>
  makeType(
    (val): val is string => typeof val === "string",
    errorMessage(
      typeError,
      string.ERRORS.TYPE_ERROR,
      (label) => `Expected ${label} to be a string`,
      "Expected a string"
    ),
    stringMethods
  );

string.ERRORS = {
  TYPE_ERROR: Symbol("string_error"),
  MAX_LENGTH_ERROR: Symbol("string_maxLength_error"),
  MIN_LENGTH_ERROR: Symbol("string_minLength_error"),
};
