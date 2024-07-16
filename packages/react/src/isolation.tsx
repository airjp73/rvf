import { ReactNode } from "react";
import { FormScope } from "@rvf/core";
import { FormApi, useFormInternal } from "./base";

export const Isolate = <FormValue,>({
  form,
  render,
}: {
  form: FormScope<FormValue>;
  render: (form: FormApi<FormValue>) => ReactNode;
}) => {
  const rvf = useFormInternal(form);
  return render(rvf);
};
