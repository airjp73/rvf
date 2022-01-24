import { FC } from "react";
import { useField } from "remix-validated-form";

export type CheckboxGroupProps = {
  label: string;
  name: string;
};

export const CheckboxGroup: FC<CheckboxGroupProps> = ({
  label,
  name,
  children,
}) => {
  const { error } = useField(name);
  return (
    <fieldset>
      <legend>{label}</legend>
      {children}
      {error && <p className="myErrorClass">{error}</p>}
    </fieldset>
  );
};
