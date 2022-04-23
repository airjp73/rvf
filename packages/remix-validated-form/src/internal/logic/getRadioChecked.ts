export const getRadioChecked = (
  radioValue: string | undefined = "on",
  newValue: unknown
) => {
  if (typeof newValue === "string") return newValue === radioValue;
  return undefined;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("getRadioChecked", () => {
    expect(getRadioChecked("on", "on")).toBe(true);
    expect(getRadioChecked("on", undefined)).toBe(undefined);
    expect(getRadioChecked("trueValue", undefined)).toBe(undefined);
    expect(getRadioChecked("trueValue", "bob")).toBe(false);
    expect(getRadioChecked("trueValue", "trueValue")).toBe(true);
  });
}
