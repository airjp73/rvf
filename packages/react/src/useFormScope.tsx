import { Rvf } from "@rvf/core";
import { RvfReact, useRvfInternal } from "./base";

/**
 * Interprets an `Rvf` created via `form.scope`, for use in a subcomponent.
 */
export function useFormScope<FormInputData>(
  form: Rvf<FormInputData>,
): RvfReact<FormInputData> {
  return useRvfInternal(form);
}
