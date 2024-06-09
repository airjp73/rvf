import { FormScope } from "@rvf/core";
import { ReactFormApi, useFormInternal } from "./base";

/**
 * Interprets an `FormScope` created via `form.scope`, for use in a subcomponent.
 */
export function useFormScope<FormInputData>(
  form: FormScope<FormInputData>,
): ReactFormApi<FormInputData> {
  return useFormInternal(form);
}
