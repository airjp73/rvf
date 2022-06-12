import { makeType } from "../core";
import { errorMessage, ErrorMessage } from "../errors";
import { commonMethods } from "./common";

/**
 * Validates that the value is a string.
 *
 * @param typeError - Optionally specify an error message to use if the value is not a string.
 * @returns A validation schema for strings.
 */
export const undefinedType = (typeError?: ErrorMessage) =>
  makeType(
    (val): val is undefined => typeof val === "undefined",
    errorMessage(
      typeError,
      undefinedType.errorMetaKeys.typeError,
      (label) => `Expected ${label} to be undefined`,
      "Expected undefined"
    ),
    commonMethods
  );

undefinedType.errorMetaKeys = {
  typeError: Symbol("undefined_error"),
};
