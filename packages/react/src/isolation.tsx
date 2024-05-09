import { ReactNode } from "react";
import { Rvf } from "@rvf/core";
import { RvfReact, useRvfInternal } from "./base";
import { RvfField, useField } from "./field";

export const Isolate = <FormValue,>({
  form,
  render,
}: {
  form: Rvf<FormValue>;
  render: (form: RvfReact<FormValue>) => ReactNode;
}) => {
  const rvf = useRvfInternal(form);
  return render(rvf);
};

export const Field = <FormInputData,>({
  form,
  render,
}: {
  form: Rvf<FormInputData>;
  render: (field: RvfField<FormInputData>) => ReactNode;
}) => {
  const field = useField(form);
  return render(field);
};
