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

export const focusFirst = (elements: HTMLElement[]) => {
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
  firstFocusable?.focus();
};