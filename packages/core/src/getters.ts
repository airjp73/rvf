import { getPath, pathArrayToString, stringToPathArray } from "@rvf/set-get";
import { type FormStoreValue } from "./store";

export const getFieldValue = (
  state: FormStoreValue,
  fieldName: string,
): unknown => getPath(state.values, fieldName);

export const getFieldDefaultValue = (
  state: FormStoreValue,
  fieldName: string,
): unknown => {
  const path = stringToPathArray(fieldName);
  const postfix = [] as (string | number)[];

  while (path.length > 0) {
    let current = pathArrayToString(path);
    if (current in state.defaultValueOverrides) {
      const parent = state.defaultValueOverrides[current];
      if (postfix.length) return getPath(parent, postfix);
      return parent;
    }
    postfix.push(path.pop()!);
  }

  return getPath(state.defaultValues, fieldName);
};

export const getFieldTouched = (state: FormStoreValue, fieldName: string) =>
  state.touchedFields[fieldName] ?? false;

export const getFieldDirty = (state: FormStoreValue, fieldName: string) =>
  state.dirtyFields[fieldName] ?? false;

export const getFieldError = (state: FormStoreValue, fieldName: string) => {
  return (
    state.customValidationErrors[fieldName] ??
    state.validationErrors[fieldName] ??
    null
  );
};

export const getFieldArrayKeys = (state: FormStoreValue, fieldName: string) =>
  state.fieldArrayKeys[fieldName];

export const getArrayUpdateKey = (state: FormStoreValue, fieldName: string) =>
  state.arrayUpdateKeys[fieldName];

export const getAllTouched = (state: FormStoreValue) => state.touchedFields;

export const getAllDirty = (state: FormStoreValue) => state.dirtyFields;

export const getAllErrors = (state: FormStoreValue) => {
  const allErrors = {
    ...state.validationErrors,
    ...state.customValidationErrors,
  };
  if (state.submitStatus !== "idle") return allErrors;
  const fieldsWithErrors = Object.entries(allErrors).filter(
    ([fieldName]) =>
      state.touchedFields[fieldName] ||
      state.customValidationErrors[fieldName] ||
      state.validationBehaviorConfig.initial === "onChange",
  );
  return Object.fromEntries(fieldsWithErrors);
};

export const getFormId = (state: FormStoreValue) =>
  state.formProps.id ?? state.defaultFormId;

export const getFormIdOption = (state: FormStoreValue) => state.formProps.id;

export const getFormProps = (state: FormStoreValue) => ({
  ...state.formProps,
  id: getFormId(state),
});

export const getFormAction = (state: FormStoreValue) => state.formProps.action;
