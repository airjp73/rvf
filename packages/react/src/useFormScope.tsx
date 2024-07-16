import { FormScope } from "@rvf/core";
import { FormApi, useFormInternal } from "./base";

/**
 * Interprets an `FormScope` created via `form.scope`, for use in a subcomponent.
 */
export function useFormScope<FormInputData>(
  form: FormScope<FormInputData>,
): FormApi<FormInputData> {
  return useFormInternal(form);
}
