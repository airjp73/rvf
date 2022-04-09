import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import lodashGet from "lodash/get";
import {
  fieldErrorsAtom,
  formPropsAtom,
  hasBeenSubmittedAtom,
  touchedFieldsAtom,
} from "./state";
import { InternalFormId } from "./state/atomUtils";
import { controlledFieldsAtom } from "./state/controlledFields";

export const resetAtom = atomFamily((formId: InternalFormId) =>
  atom(null, (get, set) => {
    set(fieldErrorsAtom(formId), {});
    set(touchedFieldsAtom(formId), {});
    set(hasBeenSubmittedAtom(formId), false);

    const { defaultValues } = get(formPropsAtom(formId));

    const controlledFields = get(controlledFieldsAtom(formId));
    Object.entries(controlledFields).forEach(([name, atom]) =>
      set(atom, lodashGet(defaultValues, name))
    );
  })
);
