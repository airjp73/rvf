import { ReactNode } from "react";
import { FormScope } from "@rvf/core";
import { ReactFormApi, useFormInternal } from "./base";

export const Isolate = <FormValue,>({
  form,
  render,
}: {
  form: FormScope<FormValue>;
  render: (form: ReactFormApi<FormValue>) => ReactNode;
}) => {
  const rvf = useFormInternal(form);
  return render(rvf);
};
