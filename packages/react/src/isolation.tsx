import { ReactNode } from "react";
import { FormScope } from "@rvf/core";
import { FormApi, useFormInternal } from "./base";

export const Isolate = <FormValue,>({
  scope,
  render,
}: {
  scope: FormScope<FormValue>;
  render: (scope: FormApi<FormValue>) => ReactNode;
}) => {
  const rvf = useFormInternal(scope);
  return render(rvf);
};
