import { FormScope, FormStore } from "../form";
import { getFieldValue } from "../getters";
import { MultiValueMap } from "../native-form-data/MultiValueMap";
import * as R from "remeda";
import { FieldErrors } from "../types";
import { getNextCheckboxValue } from "./getCheckboxChecked";
import { RefStore } from "../store";

export const setFormControlValue = (element: HTMLElement, value: unknown) => {
  if (element instanceof HTMLInputElement) {
    switch (element.type) {
      case "checkbox":
        element.checked = Array.isArray(value)
          ? value?.includes(element.value)
          : Boolean(value);
        break;
      case "radio":
        element.checked = value === element.value;
        break;
      case "number":
        if (value === undefined) element.value = "";
        else element.valueAsNumber = Number(value);
        break;
      case "file":
        if (!value) element.value = "";
        // Can't set the value other than to clear it
        break;
      default:
        element.value = value ? String(value) : "";
        break;
    }
  }

  // TODO: maybe we can eventually support other form controls
};

export const getFormControlValue = (element: HTMLElement) => {
  if (element instanceof HTMLInputElement) {
    switch (element.type) {
      case "checkbox":
      case "radio":
        return element.checked;
      case "number":
        return element.valueAsNumber;
      default:
        return element.value;
    }
  }

  if (element instanceof HTMLSelectElement) {
    return element.value;
  }

  if (element instanceof HTMLTextAreaElement) {
    return element.value;
  }

  // TODO: maybe we can eventually support other form controls
  return undefined;
};

export type FormControl =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export const isFormControl = (el: EventTarget): el is FormControl =>
  el instanceof HTMLInputElement ||
  el instanceof HTMLSelectElement ||
  el instanceof HTMLTextAreaElement;

const sortByPosition = (elements: HTMLElement[]) => {
  return [...elements].sort((a, b) => {
    const comparison = a.compareDocumentPosition(b);
    if (comparison & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    } else if (comparison & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }
    return 0;
  });
};

const handleRadioFocus = (sortedElements: HTMLElement[]) => {
  /* Radio groups get special treatment -- the selected radio gets focused. */
  const formControls = sortedElements.filter(isFormControl);
  const firstControl = formControls[0];

  const endOfFirstFieldsElements = formControls.findIndex(
    (el) => el.name !== firstControl.name,
  );
  const firstFieldElements = formControls.slice(0, endOfFirstFieldsElements);

  if (firstFieldElements.every((el) => el.type === "radio")) {
    const checkedElement = firstFieldElements.find(
      (el) => el instanceof HTMLInputElement && el.checked,
    );
    return checkedElement;
  }
};

const getElementToFocus = (elements: HTMLElement[]) => {
  const sorted = sortByPosition(elements).filter((el) => "focus" in el);

  if (sorted.length === 0) return undefined;

  const firstElement = sorted[0];
  if (!isFormControl(firstElement)) return firstElement;
  return handleRadioFocus(sorted) ?? firstElement;
};

export const focusOrReport = (elements: HTMLElement[]) => {
  const firstFocusable = getElementToFocus(elements);
  if (
    firstFocusable &&
    "checkValidity" in firstFocusable &&
    typeof firstFocusable.checkValidity === "function" &&
    !firstFocusable.checkValidity() &&
    "reportValidity" in firstFocusable &&
    typeof firstFocusable.reportValidity === "function"
  ) {
    firstFocusable.reportValidity();
  } else {
    firstFocusable?.focus();
  }
};

export const focusFirst = (elements: HTMLElement[]) => {
  const firstFocusable = sortByPosition(elements).find(
    (element): element is typeof element & { focus: () => void } =>
      "focus" in element,
  );
  firstFocusable?.focus();
};

export const getElementsWithNames = (
  names: string[],
  formElement: HTMLFormElement,
) => {
  if (names.length === 0) return [];

  const els = document.querySelectorAll(
    names.map((name) => `[name="${name}"]`).join(","),
  );

  return [...els].filter(
    (el) => isFormControl(el) && el.form === formElement,
  ) as HTMLElement[];
};

export const getNextNativeValue = ({
  element,
  currentValue,
}: {
  element: FormControl;
  currentValue: unknown;
}) => {
  const derivedValue = getFormControlValue(element);

  if (element.type === "checkbox") {
    const nextValue = getNextCheckboxValue({
      currentValue,
      derivedValue,
      valueProp: element.value,
    });
    return nextValue;
  }

  if (element.type === "radio") {
    return element.value;
  }

  if (element.type === "number") {
    if (typeof currentValue === "string") return String(derivedValue);
    return Number(derivedValue);
  }

  return derivedValue;
};

export const onNativeChange = (event: Event, store: FormStore) => {
  if (event.defaultPrevented) return;
  const transientState = () => store.store.getState();

  const changed = event.target;
  const formEl = store.formRef.current;

  if (
    !formEl ||
    !changed ||
    !isFormControl(changed) ||
    !changed.form ||
    changed.form !== formEl
  )
    return;

  const name = changed.name;
  if (store.transientFieldRefs.has(name) || store.controlledFieldRefs.has(name))
    return;

  transientState().onFieldChange(
    name,
    getNextNativeValue({
      element: changed,
      currentValue: getFieldValue(transientState(), name),
    }),
  );
};

export const onNativeBlur = (event: FocusEvent, store: FormStore) => {
  if (event.defaultPrevented) return;
  const transientState = () => store.store.getState();

  const changed = event.target;
  const formEl = store.formRef.current;

  if (
    !formEl ||
    !changed ||
    !isFormControl(changed) ||
    !changed.form ||
    changed.form !== formEl
  )
    return;

  const name = changed.name;
  if (store.transientFieldRefs.has(name) || store.controlledFieldRefs.has(name))
    return;

  transientState().onFieldBlur(name);
};

export const registerFormElementEvents = (store: FormStore) => {
  const onChange = (event: Event) => onNativeChange(event, store);
  const onBlur = (event: FocusEvent) => onNativeBlur(event, store);

  document.addEventListener("input", onChange);
  document.addEventListener("focusout", onBlur);

  return () => {
    document.removeEventListener("input", onChange);
    document.removeEventListener("focusout", onBlur);
  };
};
