import { controlledFieldStore } from "./controlledFieldStore";
import { formStore } from "./createFormStore";
import { InternalFormId } from "./storeFamily";

export const cleanupFormState = (formId: InternalFormId) => {
  formStore.remove(formId);
  controlledFieldStore.remove(formId);
};
