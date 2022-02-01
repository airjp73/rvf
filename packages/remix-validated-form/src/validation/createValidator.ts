import { GenericObject, Validator } from "..";
import { objectFromPathEntries } from "../internal/flatten";

const preprocessFormData = (data: GenericObject | FormData): GenericObject => {
  // A slightly janky way of determining if the data is a FormData object
  // since node doesn't really have FormData
  if ("entries" in data && typeof data.entries === "function")
    return objectFromPathEntries([...data.entries()]);
  return objectFromPathEntries(Object.entries(data));
};

/**
 * Used to create a validator for a form.
 * It provides built-in handling for unflattening nested objects and
 * extracting the values from FormData.
 */
export function createValidator<T>(validator: Validator<T>): Validator<T> {
  return {
    validate: async (value: GenericObject | FormData) => {
      const data = preprocessFormData(value);
      const result = await validator.validate(data);
      if (result.error) {
        // Ideally, we should probably be returning a nested object like
        // { fieldErrors: {}, submittedData: {} }
        // We should do this in the next major version of the library
        // but for now, we can sneak it in with the fieldErrors.
        result.error._submittedData = data as any;
      }
      return result;
    },
    validateField: async (data: GenericObject | FormData, field: string) =>
      await validator.validateField(preprocessFormData(data), field),
  };
}
