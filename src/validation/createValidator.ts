import { GenericObject, Validator } from "..";
import { objectFromPathEntries } from "../flatten";

const preprocessFormData = (data: GenericObject | FormData): GenericObject => {
  // A slightly janky way of determining if the data is a FormData object
  // since node doesn't really have FormData
  if ("entries" in data && typeof data.entries === "function")
    return objectFromPathEntries([...data.entries()]);
  return objectFromPathEntries(Object.entries(data));
};

/** Handles data manipulation such us flattening the data to send to the validator */
export function createValidator<T>(validator: Validator<T>): Validator<T> {
  return {
    validate: (value: GenericObject | FormData) =>
      validator.validate(preprocessFormData(value)),
    validateField: (data: GenericObject | FormData, field: string) =>
      validator.validateField(preprocessFormData(data), field),
  };
}
