import { FormState, useRootFormStore } from "./createFormStore";
import { InternalFormId } from "./types";

export const useFormStore = <T>(
  formId: InternalFormId,
  selector: (state: FormState) => T
) => {
  return useRootFormStore((state) => selector(state.form(formId)));
};
