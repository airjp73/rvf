import { PropsWithChildren } from "react";
import { useField } from "remix-validated-form";

export type CheckboxGroupProps = PropsWithChildren<{
  label: string;
  name: string;
}>;

export const CheckboxGroup = ({
  label,
  name,
  children,
}: CheckboxGroupProps) => {
  const { error } = useField(name);
  return (
    <fieldset>
      <legend>{label}</legend>
      {children}
      {error && <p className="myErrorClass">{error}</p>}
    </fieldset>
  );
};
