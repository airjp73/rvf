import { GenericObject, Validator } from "..";
import { unflatten } from "../flatten";

/** Handles data manipulation such us flattening the data to send to the validator */
export function createValidator<T>(validator: Validator<T>): Validator<T> {
  return {
    validate: (value: GenericObject) => validator.validate(unflatten(value)),
    validateField: (data: GenericObject, field: string) =>
      validator.validateField(unflatten(data), field),
  };
}
