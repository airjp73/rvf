import { getPath } from "set-get";
import { FormStoreValue } from "./store";

export const getFieldValue = (state: FormStoreValue, fieldName: string) =>
  getPath(state.values, fieldName);

export const getFieldDefaultValue = (
  state: FormStoreValue,
  fieldName: string,
) => getPath(state.defaultValues, fieldName);

export const getFieldTouched = (state: FormStoreValue, fieldName: string) =>
  state.touchedFields[fieldName] ?? false;

export const getFieldDirty = (state: FormStoreValue, fieldName: string) =>
  state.dirtyFields[fieldName] ?? false;

export const getFieldError = (state: FormStoreValue, fieldName: string) => {
  if (
    state.submitStatus !== "idle" ||
    state.touchedFields[fieldName] ||
    state.validationBehaviorConfig.initial === "onChange"
  )
    return state.validationErrors[fieldName] ?? null;
  return null;
};
