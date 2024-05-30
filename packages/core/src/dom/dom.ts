import { Rvf, RvfStore } from "../form";
import { getFieldValue } from "../getters";
import { getNextCheckboxValue } from "./getCheckboxChecked";

export const setFormControlValue = (element: HTMLElement, value: unknown) => {
  if (element instanceof HTMLInputElement) {
    switch (element.type) {
      case "checkbox":
        element.checked = Array.isArray(value)
          ? value.includes(element.value)
          : Boolean(value);
        break;
      case "radio":
        element.checked = value === element.value;
        break;
      case "number":
        element.valueAsNumber = Number(value);
        break;
      default:
        element.value = String(value);
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

const getFirst = (elements: HTMLElement[]) => {
  const sorted = elements.toSorted((a, b) => {
    const comparison = a.compareDocumentPosition(b);
    if (comparison & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    } else if (comparison & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }
    return 0;
  });
  const firstFocusable = sorted.find(
    (element): element is typeof element & { focus: () => void } =>
      "focus" in element,
  );
  return firstFocusable;
};

export const focusOrReportFirst = (elements: HTMLElement[]) => {
  const firstFocusable = getFirst(elements);
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
  const firstFocusable = getFirst(elements);
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

export const registerFormElementEvents = (store: RvfStore) => {
  const transientState = () => store.store.getState();

  const onChange = (event: Event) => {
    if (event.defaultPrevented) return;

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
    if (
      store.transientFieldRefs.has(name) ||
      store.controlledFieldRefs.has(name)
    )
      return;

    const getValue = () => {
      const derivedValue = getFormControlValue(changed);

      if (changed.type === "checkbox") {
        const nextValue = getNextCheckboxValue({
          currentValue: getFieldValue(transientState(), name),
          derivedValue,
          valueProp: changed.value,
        });
        return nextValue;
      }

      if (changed.type === "radio") {
        return changed.value;
      }

      return derivedValue;
    };

    transientState().onFieldChange(name, getValue());
  };

  const onBlur = (event: FocusEvent) => {
    if (event.defaultPrevented) return;

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
    if (
      store.transientFieldRefs.has(name) ||
      store.controlledFieldRefs.has(name)
    )
      return;

    transientState().onFieldBlur(name);
  };

  document.addEventListener("input", onChange);
  document.addEventListener("focusout", onBlur);

  return () => {
    document.removeEventListener("input", onChange);
    document.removeEventListener("focusout", onBlur);
  };
};
