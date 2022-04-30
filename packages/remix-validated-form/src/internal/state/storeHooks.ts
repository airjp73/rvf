import {
  ControlledFieldState,
  controlledFieldStore,
} from "./controlledFieldStore";
import { FormState, formStore } from "./createFormStore";
import { InternalFormId } from "./storeFamily";

export const useFormStore = <T>(
  formId: InternalFormId,
  selector: (state: FormState) => T
) => {
  const useStore = formStore(formId);
  return useStore(selector);
};

export const useControlledFieldStore = <T>(
  formId: InternalFormId,
  selector: (state: ControlledFieldState) => T
) => {
  const useStore = controlledFieldStore(formId);
  return useStore(selector);
};
