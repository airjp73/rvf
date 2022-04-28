import { FormState, formStore } from "./createFormStore";
import { InternalFormId } from "./storeFamily";

export const useFormStore = <T>(
  formId: InternalFormId,
  selector: (state: FormState) => T
) => {
  const useStore = formStore(formId);
  return useStore(selector);
};
