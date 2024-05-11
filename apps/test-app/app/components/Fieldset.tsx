import { FC, PropsWithChildren } from "react";
import { useField } from "@rvf/remix";

type FieldsetProps = PropsWithChildren<{
  label: string;
  name: string;
}>;

export const Fieldset: FC<FieldsetProps> = ({ children, label, name }) => {
  const { error, validate } = useField(name);
  return (
    <fieldset onChange={validate}>
      <legend>{label}</legend>
      {children}
      {error() ? <p style={{ color: "red" }}>{error()}</p> : null}
    </fieldset>
  );
};
