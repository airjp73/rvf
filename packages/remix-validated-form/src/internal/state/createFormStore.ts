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
};

export const formStore = storeFamily(() =>
  create<FormState>()(
    immer((set, get, api) => ({
      isHydrated: false,
      isSubmitting: false,
      hasBeenSubmitted: false,
      touchedFields: {},
      fieldErrors: {},
      formElement: null,
      formProps: {
        validateField: () => Promise.resolve(null),
        registerReceiveFocus: () => () => {},
        defaultValues: {},
      },

      isValid: () => Object.keys(get().fieldErrors).length === 0,
      startSubmit: () =>
        set((state: FormState) => {
          state.isSubmitting = true;
          state.hasBeenSubmitted = true;
        }),
      endSubmit: () =>
        set((state: FormState) => {
          state.isSubmitting = false;
        }),
      setTouched: (fieldName, touched) =>
        set((state: FormState) => {
          state.touchedFields[fieldName] = touched;
        }),
      setFieldError: (fieldName: string, error: string) =>
        set((state: FormState) => {
          state.fieldErrors[fieldName] = error;
        }),
      setFieldErrors: (errors: FieldErrors) =>
        set((state: FormState) => {
          state.fieldErrors = errors;
        }),
      clearFieldError: (fieldName: string) =>
        set((state: FormState) => {
          delete state.fieldErrors[fieldName];
        }),

      reset: () =>
        set((state: FormState) => {
          state.fieldErrors = {};
          state.touchedFields = {};
          state.hasBeenSubmitted = false;
        }),
      syncFormProps: (props: SyncedFormProps) =>
        set((state: FormState) => {
          state.formProps = props;
        }),
      setHydrated: () =>
        set((state: FormState) => {
          state.isHydrated = true;
        }),
      setFormElement: (formElement: HTMLFormElement | null) =>
        set((state: FormState) => {
          state.formElement = formElement;
        }),
    }))
  )
);
