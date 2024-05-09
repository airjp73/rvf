export const getCheckboxChecked = (
  checkboxValue: string | undefined = "on",
  newValue: unknown,
): boolean | undefined => {
  if (Array.isArray(newValue))
    return newValue.some((val) => val === true || val === checkboxValue);
  if (typeof newValue === "boolean") return newValue;
  if (typeof newValue === "string") return newValue === checkboxValue;
  return undefined;
};

export const getNextCheckboxValue = ({
  derivedValue,
  valueProp,
  currentValue,
}: {
  derivedValue: unknown;
  valueProp: string;
  currentValue: unknown;
}) => {
  // The derived value should be the `checked` value of the checkbox.
  // If it isn't, we can't do anything smart here.
  if (typeof derivedValue !== "boolean") return derivedValue;

  if (Array.isArray(currentValue)) {
    const values = new Set(currentValue);
    if (derivedValue) values.add(valueProp);
    else values.delete(valueProp);
    return [...values];
  }

  return derivedValue;
};
