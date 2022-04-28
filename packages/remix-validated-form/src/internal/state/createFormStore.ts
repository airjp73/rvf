import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { FieldErrors, TouchedFields } from "../../validation/types";
import { storeFamily } from "./storeFamily";

export type SyncedFormProps = {
  formId?: string;
  action?: string;
  subaction?: string;
  defaultValues: { [fieldName: string]: any };
  validateField: (fieldName: string) => Promise<string | null>;
  registerReceiveFocus: (fieldName: string, handler: () => void) => () => void;
};

export type FormState = {
  isHydrated: boolean;
  isSubmitting: boolean;
  hasBeenSubmitted: boolean;
  fieldErrors: FieldErrors;
  touchedFields: TouchedFields;
  formProps: SyncedFormProps;

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
};

export const formStore = storeFamily(() =>
  create<FormState>()(
    immer((set, get, api) => ({
      isHydrated: false,
      isSubmitting: false,
      hasBeenSubmitted: false,
      touchedFields: {},
      fieldErrors: {},
      formProps: {
        validateField: () => Promise.resolve(null),
        registerReceiveFocus: () => () => {},
        defaultValues: {},
      },

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
        }),
      setHydrated: () =>
        set((state) => {
          state.isHydrated = true;
        }),
    }))
  )
);
