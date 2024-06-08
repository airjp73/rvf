import { getPath } from "set-get";
import { FormStoreValue } from "./store";

export const getFieldValue = (
  state: FormStoreValue,
  fieldName: string,
): unknown => getPath(state.values, fieldName);

export const getFieldDefaultValue = (
  state: FormStoreValue,
  fieldName: string,
): unknown => getPath(state.defaultValues, fieldName);

export const getFieldTouched = (state: FormStoreValue, fieldName: string) =>
  state.touchedFields[fieldName] ?? false;

export const getFieldDirty = (state: FormStoreValue, fieldName: string) =>
  state.dirtyFields[fieldName] ?? false;

export const getFieldError = (state: FormStoreValue, fieldName: string) => {
  return state.validationErrors[fieldName] ?? null;
};

export const getFieldArrayKeys = (state: FormStoreValue, fieldName: string) =>
  state.fieldArrayKeys[fieldName];

export const getArrayUpdateKey = (state: FormStoreValue, fieldName: string) =>
  state.arrayUpdateKeys[fieldName];

export const getAllTouched = (state: FormStoreValue) => state.touchedFields;

export const getAllDirty = (state: FormStoreValue) => state.dirtyFields;

export const getAllErrors = (state: FormStoreValue) => {
  if (state.submitStatus !== "idle") return state.validationErrors;
  const fieldsWithErrors = Object.entries(state.validationErrors).filter(
    ([fieldName]) =>
      state.touchedFields[fieldName] ||
      state.validationBehaviorConfig.initial === "onChange",
  );
  return Object.fromEntries(fieldsWithErrors);
};

export const getFormId = (state: FormStoreValue) => state.formProps.id;

export const getFormProps = (state: FormStoreValue) => state.formProps;

export const getFormAction = (state: FormStoreValue) => state.formProps.action;
