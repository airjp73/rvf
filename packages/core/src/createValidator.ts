import { CreateValidatorArg, Validator } from "./types";
import { preprocessFormData } from "./native-form-data/flatten";

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

      if (result.error) {
        return {
          data: undefined,
          error: {
            fieldErrors: result.error,
          },
          submittedData: data,
        };
      }

      return {
        data: result.data,
        error: undefined,
        submittedData: data,
      };
    },
  };
}
