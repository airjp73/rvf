import { atom } from "jotai";
import { atomFamily, selectAtom } from "jotai/utils";
import omit from "lodash/omit";
import { FieldErrors, TouchedFields } from "../validation/types";
import {
  fieldAtomFamily,
  formAtomFamily,
  InternalFormId,
} from "./state/atomUtils";

export const ATOM_SCOPE = Symbol("remix-validated-form-scope");

export type SyncedFormProps = {
  formId?: string;
  action?: string;
  subaction?: string;
  defaultValues: { [fieldName: string]: any };
  validateField: (fieldName: string) => Promise<string | null>;
  registerReceiveFocus: (fieldName: string, handler: () => void) => () => void;
};

export const isHydratedAtom = formAtomFamily(false);
export const isSubmittingAtom = formAtomFamily(false);
export const hasBeenSubmittedAtom = formAtomFamily(false);
export const fieldErrorsAtom = formAtomFamily<FieldErrors>({});
export const touchedFieldsAtom = formAtomFamily<TouchedFields>({});
export const formPropsAtom = formAtomFamily<SyncedFormProps>({
  validateField: () => Promise.resolve(null),
  registerReceiveFocus: () => () => {},
  defaultValues: {},
});
export const formElementAtom = formAtomFamily<HTMLFormElement | null>(null);

//// Everything below is derived from the above

export const cleanupFormState = (formId: InternalFormId) => {
  [
    isHydratedAtom,
    isSubmittingAtom,
    hasBeenSubmittedAtom,
    fieldErrorsAtom,
    touchedFieldsAtom,
    formPropsAtom,
  ].forEach((formAtom) => formAtom.remove(formId));
};

export const isValidAtom = atomFamily((formId: InternalFormId) =>
  atom((get) => Object.keys(get(fieldErrorsAtom(formId))).length === 0)
);

export const resetAtom = atomFamily((formId: InternalFormId) =>
  atom(null, (_get, set) => {
    set(fieldErrorsAtom(formId), {});
    set(touchedFieldsAtom(formId), {});
    set(hasBeenSubmittedAtom(formId), false);
  })
);

export const startSubmitAtom = atomFamily((formId: InternalFormId) =>
  atom(null, (_get, set) => {
    set(isSubmittingAtom(formId), true);
    set(hasBeenSubmittedAtom(formId), true);
  })
);

export const endSubmitAtom = atomFamily((formId: InternalFormId) =>
  atom(null, (_get, set) => {
    set(isSubmittingAtom(formId), false);
  })
);

export const setTouchedAtom = atomFamily((formId: InternalFormId) =>
  atom(
    null,
    (get, set, { field, touched }: { field: string; touched: boolean }) => {
      const prev = get(touchedFieldsAtom(formId));
      if (prev[field] !== touched) {
        set(touchedFieldsAtom(formId), {
          ...prev,
          [field]: touched,
        });
      }
    }
  )
);

export const setFieldErrorAtom = atomFamily((formId: InternalFormId) =>
  atom(
    null,
    (
      get,
      set,
      { field, error }: { field: string; error: string | undefined }
    ) => {
      const prev = get(fieldErrorsAtom(formId));
      if (error === undefined && field in prev) {
        set(fieldErrorsAtom(formId), omit(prev, field));
      }

      if (error !== undefined && prev[field] !== error) {
        set(fieldErrorsAtom(formId), {
          ...get(fieldErrorsAtom(formId)),
          [field]: error,
        });
      }
    }
  )
);

//// Field specific

export const fieldTouchedAtom = fieldAtomFamily(({ formId, field }) =>
  atom(
    (get) => get(touchedFieldsAtom(formId))[field],
    (_get, set, touched: boolean) => {
      set(setTouchedAtom(formId), { field, touched });
    }
  )
);

export const fieldErrorAtom = fieldAtomFamily(({ formId, field }) =>
  atom(
    (get) => get(fieldErrorsAtom(formId))[field],
    (_get, set, error: string | undefined) => {
      set(setFieldErrorAtom(formId), { field, error });
    }
  )
);

export const fieldDefaultValueAtom = fieldAtomFamily(({ formId, field }) =>
  selectAtom(formPropsAtom(formId), (state) => state.defaultValues[field])
);
