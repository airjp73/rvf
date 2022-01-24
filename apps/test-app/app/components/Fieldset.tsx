import { FC } from "react";
import { useField } from "remix-validated-form";

type FieldsetProps = {
  label: string;
};

export const Fieldset: FC<FieldsetProps> = ({ children, label }) => {
  const { error, validate } = useField("likes");
  return (
    <fieldset onChange={validate}>
      <legend>{label}</legend>
      {children}
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
    </fieldset>
  );
};
