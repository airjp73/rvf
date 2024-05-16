import { FC, PropsWithChildren } from "react";
import { Rvf, useField } from "@rvf/remix";

type FieldsetProps = PropsWithChildren<{
  label: string;
  name: string;
  rvf?: Rvf<any>;
}>;

export const Fieldset: FC<FieldsetProps> = ({ children, label, name, rvf }) => {
  // Not actually breaking rules here
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { error, validate } = rvf ? useField(rvf) : useField(name);
  return (
    <fieldset onChange={validate}>
      <legend>{label}</legend>
      {children}
      {error() ? <p style={{ color: "red" }}>{error()}</p> : null}
    </fieldset>
  );
};
