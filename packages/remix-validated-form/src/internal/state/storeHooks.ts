import {
  ControlledFieldState,
  controlledFieldStore,
} from "./controlledFieldStore";
import { FormState, useRootFormStore } from "./createFormStore";
import { InternalFormId } from "./storeFamily";

export const useFormStore = <T>(
  formId: InternalFormId,
  selector: (state: FormState) => T
) => {
  return useRootFormStore((state) => selector(state.form(formId)));
};

export const useControlledFieldStore = <T>(
  formId: InternalFormId,
  selector: (state: ControlledFieldState) => T
) => {
  const useStore = controlledFieldStore(formId);
  return useStore(selector);
};
