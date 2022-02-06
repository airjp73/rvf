import { atom } from "jotai";
import { atomWithImmer } from "jotai/immer";
import { atomFamily, selectAtom } from "jotai/utils";
import lodashGet from "lodash/get";
import { FieldErrors, TouchedFields } from "../validation/types";

export const ATOM_SCOPE = Symbol("remix-validated-form-scope");

export type FormState = {
  // Actual state
  hydrated: boolean;
  fieldErrors?: FieldErrors;
  isSubmitting: boolean;
  hasBeenSubmitted: boolean;
  touchedFields: TouchedFields;

  // Populated by the form component
  formId?: string;
  action?: string;
  subaction?: string;
  defaultValues?: { [fieldName: string]: any };
  validateField: (fieldName: string) => Promise<string | null>;
  registerReceiveFocus: (fieldName: string, handler: () => void) => () => void;
};

export type FormAtom = ReturnType<typeof formRegistry>;

export type FieldState = {
  touched: boolean;
  defaultValue?: any;
  error?: string;
};

export type CreateFormAtomArgs = {
  formId: string | symbol;
  defaultValues?: { [fieldName: string]: any };
};

export const formRegistry = atomFamily((formId: string | symbol) =>
  atomWithImmer<FormState>({
    hydrated: false,
    isSubmitting: false,
    hasBeenSubmitted: false,
    touchedFields: {},

    // The symbol version is just to keep things straight with the `atomFamily`
    formId: typeof formId === "string" ? formId : undefined,

    // Will change upon hydration -- these will never actually be used
    validateField: () => Promise.resolve(null),
    registerReceiveFocus: () => () => {},
  })
);

export const fieldErrorAtom = (name: string) => (formAtom: FormAtom) =>
  selectAtom(formAtom, (formState) => formState.fieldErrors?.[name]);

export const fieldTouchedAtom = (name: string) => (formAtom: FormAtom) =>
  selectAtom(formAtom, (formState) => formState.touchedFields[name]);

export const fieldDefaultValueAtom = (name: string) => (formAtom: FormAtom) =>
  selectAtom(
    formAtom,
    (formState) =>
      formState.defaultValues && lodashGet(formState.defaultValues, name)
  );

// Selector atoms

export const formSelectorAtom =
  <T>(selector: (state: FormState) => T) =>
  (formAtom: FormAtom) =>
    selectAtom(formAtom, selector);

export const fieldErrorsAtom = formSelectorAtom((state) => state.fieldErrors);
export const touchedFieldsAtom = formSelectorAtom(
  (state) => state.touchedFields
);
export const actionAtom = formSelectorAtom((state) => state.action);
export const hasBeenSubmittedAtom = formSelectorAtom(
  (state) => state.hasBeenSubmitted
);
export const validateFieldAtom = formSelectorAtom(
  (state) => state.validateField
);
export const registerReceiveFocusAtom = formSelectorAtom(
  (state) => state.registerReceiveFocus
);
export const isSubmittingAtom = formSelectorAtom((state) => state.isSubmitting);
export const defaultValuesAtom = formSelectorAtom(
  (state) => state.defaultValues
);
export const isValidAtom = formSelectorAtom(
  (state) => Object.keys(state.fieldErrors ?? {}).length === 0
);
export const isHydratedAtom = formSelectorAtom((state) => state.hydrated);

// Update atoms

export type FieldAtomArgs = {
  name: string;
  formAtom: FormAtom;
};

export const clearErrorAtom = atom(
  null,
  (get, set, { name, formAtom }: FieldAtomArgs) =>
    set(formAtom, (state) => {
      delete state.fieldErrors?.[name];
      return state;
    })
);

export const addErrorAtom = atom(
  null,
  (get, set, { name, formAtom, error }: FieldAtomArgs & { error: string }) =>
    set(formAtom, (state) => {
      if (!state.fieldErrors) state.fieldErrors = {};
      state.fieldErrors[name] = error;
      return state;
    })
);

export const setFieldErrorsAtom = atom(
  null,
  (
    get,
    set,
    { formAtom, fieldErrors }: { fieldErrors: FieldErrors; formAtom: FormAtom }
  ) =>
    set(formAtom, (state) => {
      state.fieldErrors = fieldErrors;
      return state;
    })
);

export const setTouchedAtom = atom(
  null,
  (
    get,
    set,
    { name, formAtom, touched }: FieldAtomArgs & { touched: boolean }
  ) =>
    set(formAtom, (state) => {
      state.touchedFields[name] = touched;
      return state;
    })
);

export const resetAtom = atom(
  null,
  (get, set, { formAtom }: { formAtom: FormAtom }) => {
    set(formAtom, (state) => {
      state.fieldErrors = {};
      state.touchedFields = {};
      state.hasBeenSubmitted = false;
      return state;
    });
  }
);

export const startSubmitAtom = atom(
  null,
  (get, set, { formAtom }: { formAtom: FormAtom }) => {
    set(formAtom, (state) => {
      state.hasBeenSubmitted = true;
      state.isSubmitting = true;
      return state;
    });
  }
);

export const endSubmitAtom = atom(
  null,
  (get, set, { formAtom }: { formAtom: FormAtom }) => {
    set(formAtom, (state) => {
      state.isSubmitting = false;
      return state;
    });
  }
);

type SyncFormContextArgs = {
  defaultValues?: { [fieldName: string]: any };
  action?: string;
  subaction?: string;
  validateField: FormState["validateField"];
  registerReceiveFocus: FormState["registerReceiveFocus"];
  formAtom: FormAtom;
};
export const syncFormContextAtom = atom(
  null,
  (
    get,
    set,
    {
      defaultValues,
      action,
      subaction,
      formAtom,
      validateField,
      registerReceiveFocus,
    }: SyncFormContextArgs
  ) => {
    set(formAtom, (state) => {
      state.defaultValues = defaultValues;
      state.action = action;
      state.subaction = subaction;
      state.registerReceiveFocus = registerReceiveFocus;
      state.validateField = validateField;
      state.hydrated = true;
      return state;
    });
  }
);
