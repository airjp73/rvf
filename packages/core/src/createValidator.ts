import {
  CreateValidatorArg,
  ValidationErrorResponseData,
  Validator,
} from "./types";
import { preprocessFormData } from "./native-form-data/flatten";
import { FORM_ID_FIELD_NAME } from "./constants";

/**
 * Used to create a validator for a form.
 * It provides built-in handling for unflattening nested objects and
 * extracting the values from FormData.
 */
export function createValidator<T>(
  validator: CreateValidatorArg<T>,
): Validator<T> {
  return {
    validate: async (value) => {
      const data = preprocessFormData(value);
      const result = await validator.validate(data);
      const formId = data[FORM_ID_FIELD_NAME];

      if (result.error) {
        return {
          data: undefined,
          error: {
            fieldErrors: result.error,
            formId,
          },
          submittedData: data,
          formId,
        };
      }

      return {
        data: result.data,
        error: undefined,
        submittedData: data,
        formId,
      };
    },
  };
}

export const isValidationErrorResponse = <T>(
  response: T | ValidationErrorResponseData,
): response is ValidationErrorResponseData =>
  typeof response === "object" &&
  response !== null &&
  "fieldErrors" in response;
