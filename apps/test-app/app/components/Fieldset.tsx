import { FC, PropsWithChildren } from "react";
import { useField } from "remix-validated-form";

type FieldsetProps = PropsWithChildren<{
  label: string;
  name: string;
  form?: string;
}>;

export const Fieldset: FC<FieldsetProps> = ({
  children,
  label,
  name,
  form,
}) => {
  const { error, validate } = useField(name, {
    formId: form,
  });
  return (
    <fieldset onChange={validate}>
      <legend>{label}</legend>
      {children}
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
    </fieldset>
  );
};
