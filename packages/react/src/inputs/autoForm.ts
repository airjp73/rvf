import { getFormControlValue } from "@rvf/core";
import { getNextCheckboxValue } from "./logic/getCheckboxChecked";
import { isFormControl } from "./logic/isFormControl";

export const setupAutoForm = ({
  formElement,
  isUserManaged,
  onChange,
  onBlur,
  getCurrentValue,
}: {
  formElement: HTMLFormElement;
  isUserManaged: (name: string) => boolean;
  onChange: (name: string, value: unknown) => void;
  onBlur: (name: string) => void;
  getCurrentValue: (name: string) => unknown;
}) => {
  const handleChange = (event: Event) => {
    const changed = event.target;
    if (
      !changed ||
      !isFormControl(changed) ||
      !changed.form ||
      changed.form !== formElement
    )
      return;

    const name = changed.name;
    if (isUserManaged(name)) return;

    const getValue = () => {
      const derivedValue = getFormControlValue(changed);

      if (changed.type === "checkbox") {
        const nextValue = getNextCheckboxValue({
          currentValue: getCurrentValue(name),
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

    onChange(name, getValue());
  };

  const handleBlur = (event: Event) => {
    const changed = event.target;
    if (
      !changed ||
      !isFormControl(changed) ||
      !changed.form ||
      changed.form !== formElement
    )
      return;

    const name = changed.name;
    if (!isUserManaged(name)) return;

    onBlur(name);
  };

  document.addEventListener("change", handleChange);
  document.addEventListener("blur", handleBlur);

  return () => {
    document.removeEventListener("change", handleChange);
    document.removeEventListener("blur", handleBlur);
  };
};
