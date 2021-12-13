import { GenericObject, Validator } from "..";
import { objectFromPathEntries } from "../flatten";

const preprocessFormData = (data: GenericObject | FormData): GenericObject => {
  if (data instanceof FormData) return objectFromPathEntries([...data]);
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
