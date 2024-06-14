import {
  FormScope,
  getFieldValue,
  isFormControl,
  setFormControlValue,
} from "@rvf/core";
import { RefCallback } from "react";

// This is a little hacky, but we can simplify when React adds ref cleanup functions.
export const createTransientRef = (
  fieldName: string,
  form: FormScope<any>,
): RefCallback<HTMLElement> => {
  const sym = Symbol(fieldName);
  return (el) => {
    if (el == null) {
      form.__store__.transientFieldRefs.removeRef(fieldName, sym);
      return;
    }

    form.__store__.transientFieldRefs.setRef(fieldName, el, sym);
    if (isFormControl(el)) {
      const value = getFieldValue(form.__store__.store.getState(), fieldName);
      if (value != null) setFormControlValue(el, value);
    }
  };
};

export const createControlledRef = (
  fieldName: string,
  form: FormScope<any>,
): RefCallback<HTMLElement> => {
  const sym = Symbol(fieldName);
  return (el) => {
    if (el == null) {
      form.__store__.controlledFieldRefs.removeRef(fieldName, sym);
      return;
    }

    form.__store__.controlledFieldRefs.setRef(fieldName, el, sym);
  };
};
