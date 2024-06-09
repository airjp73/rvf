import { ReactNode } from "react";
import { Rvf } from "@rvf/core";
import { RvfReact, useRvfInternal } from "./base";

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
