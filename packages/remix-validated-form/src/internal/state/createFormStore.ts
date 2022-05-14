import { WritableDraft } from "immer/dist/internal";
import invariant from "tiny-invariant";
import create, { GetState } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  FieldErrors,
  TouchedFields,
  ValidationResult,
  Validator,
} from "../../validation/types";
import { useControlledFieldStore } from "./controlledFieldStore";
import { InternalFormId } from "./types";

export type SyncedFormProps = {
  formId?: string;
  action?: string;
  subaction?: string;
  defaultValues: { [fieldName: string]: any };
  registerReceiveFocus: (fieldName: string, handler: () => void) => () => void;
  validator: Validator<unknown>;
};

export type FormStoreState = {
  forms: { [formId: InternalFormId]: FormState };
  form: (formId: InternalFormId) => FormState;
  registerForm: (formId: InternalFormId) => void;
  cleanupForm: (formId: InternalFormId) => void;
};

export type FormState = {
  isHydrated: boolean;
  isSubmitting: boolean;
  hasBeenSubmitted: boolean;
  fieldErrors: FieldErrors;
  touchedFields: TouchedFields;
  formProps?: SyncedFormProps;
  formElement: HTMLFormElement | null;

  isValid: () => boolean;
  startSubmit: () => void;
  endSubmit: () => void;
  setTouched: (field: string, touched: boolean) => void;
  setFieldError: (field: string, error: string) => void;
  setFieldErrors: (errors: FieldErrors) => void;
  clearFieldError: (field: string) => void;
  reset: () => void;
  syncFormProps: (props: SyncedFormProps) => void;
  setHydrated: () => void;
  setFormElement: (formElement: HTMLFormElement | null) => void;
  validateField: (fieldName: string) => Promise<string | null>;
  validate: () => Promise<ValidationResult<unknown>>;
  resetFormElement: () => void;
};

const noOp = () => {};
const defaultFormState: FormState = {
  isHydrated: false,
  isSubmitting: false,
  hasBeenSubmitted: false,
  touchedFields: {},
  fieldErrors: {},
  formElement: null,
  isValid: () => true,
  startSubmit: noOp,
  endSubmit: noOp,
  setTouched: noOp,
  setFieldError: noOp,
  setFieldErrors: noOp,
  clearFieldError: noOp,

  reset: () => noOp,
  syncFormProps: noOp,
  setHydrated: noOp,
  setFormElement: noOp,
  validateField: async () => null,

  validate: async () => {
    throw new Error("Validate called before form was initialized.");
  },

  resetFormElement: noOp,
};

const createFormState = (
  formId: InternalFormId,
  set: (setter: (draft: WritableDraft<FormState>) => void) => void,
  get: GetState<FormState>
): FormState => ({
  // It's not "hydrated" until the form props are synced
  isHydrated: false,
  isSubmitting: false,
  hasBeenSubmitted: false,
  touchedFields: {},
  fieldErrors: {},
  formElement: null,

  isValid: () => Object.keys(get().fieldErrors).length === 0,
  startSubmit: () =>
    set((state) => {
      state.isSubmitting = true;
      state.hasBeenSubmitted = true;
    }),
  endSubmit: () =>
    set((state) => {
      state.isSubmitting = false;
    }),
  setTouched: (fieldName, touched) =>
    set((state) => {
      state.touchedFields[fieldName] = touched;
    }),
  setFieldError: (fieldName: string, error: string) =>
    set((state) => {
      state.fieldErrors[fieldName] = error;
    }),
  setFieldErrors: (errors: FieldErrors) =>
    set((state) => {
      state.fieldErrors = errors;
    }),
  clearFieldError: (fieldName: string) =>
    set((state) => {
      delete state.fieldErrors[fieldName];
    }),

  reset: () =>
    set((state) => {
      state.fieldErrors = {};
      state.touchedFields = {};
      state.hasBeenSubmitted = false;
    }),
  syncFormProps: (props: SyncedFormProps) =>
    set((state) => {
      state.formProps = props;
      state.isHydrated = true;
    }),
  setHydrated: () =>
    set((state) => {
      state.isHydrated = true;
    }),
  setFormElement: (formElement: HTMLFormElement | null) => {
    // This gets called frequently, so we want to avoid calling set() every time
    // Or else we wind up with an infinite loop
    if (get().formElement === formElement) return;
    set((state) => {
      // weird type issue here
      // seems to be because formElement is a writable draft
      state.formElement = formElement as any;
    });
  },
  validateField: async (field: string) => {
    const formElement = get().formElement;
    invariant(
      formElement,
      "Cannot find reference to form. This is probably a bug in remix-validated-form."
    );

    const validator = get().formProps?.validator;
    invariant(
      validator,
      "Cannot validator. This is probably a bug in remix-validated-form."
    );

    await useControlledFieldStore.getState().awaitValueUpdate?.(formId, field);

    const { error } = await validator.validateField(
      new FormData(formElement),
      field
    );

    if (error) {
      get().setFieldError(field, error);
      return error;
    } else {
      get().clearFieldError(field);
      return null;
    }
  },

  validate: async () => {
    const formElement = get().formElement;
    invariant(
      formElement,
      "Cannot find reference to form. This is probably a bug in remix-validated-form."
    );

    const validator = get().formProps?.validator;
    invariant(
      validator,
      "Cannot validator. This is probably a bug in remix-validated-form."
    );

    const result = await validator.validate(new FormData(formElement));
    if (result.error) get().setFieldErrors(result.error.fieldErrors);
    return result;
  },

  resetFormElement: () => get().formElement?.reset(),
});

export const useRootFormStore = create<FormStoreState>()(
  immer((set, get) => ({
    forms: {},
    form: (formId) => {
      return get().forms[formId] ?? defaultFormState;
    },
    cleanupForm: (formId: InternalFormId) => {
      set((state) => {
        delete state.forms[formId];
      });
    },
    registerForm: (formId: InternalFormId) => {
      if (get().forms[formId]) return;
      set((state) => {
        state.forms[formId] = createFormState(
          formId,
          (setter) => set((state) => setter(state.forms[formId])),
          () => get().forms[formId]
        ) as WritableDraft<FormState>;
      });
    },
  }))
);
