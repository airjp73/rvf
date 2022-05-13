import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { InternalFormId } from "./types";

export type FieldState = {
  refCount: number;
  value: unknown;
  defaultValue?: unknown;
  hydrated: boolean;
  valueUpdatePromise: Promise<void> | undefined;
  resolveValueUpdate: (() => void) | undefined;
};

export type ControlledFieldState = {
  forms: {
    [formId: InternalFormId]: {
      [fieldName: string]: FieldState | undefined;
    };
  };
  register: (formId: InternalFormId, fieldName: string) => void;
  unregister: (formId: InternalFormId, fieldName: string) => void;
  getField: (
    formId: InternalFormId,
    fieldName: string
  ) => FieldState | undefined;
  setValue: (formId: InternalFormId, fieldName: string, value: unknown) => void;
  hydrateWithDefault: (
    formId: InternalFormId,
    fieldName: string,
    defaultValue: unknown
  ) => void;
  awaitValueUpdate: (
    formId: InternalFormId,
    fieldName: string
  ) => Promise<void>;
  reset: (formId: InternalFormId) => void;
};

export const useControlledFieldStore = create<ControlledFieldState>()(
  immer((set, get) => ({
    forms: {},

    register: (formId, field) =>
      set((state) => {
        if (!state.forms[formId]) {
          state.forms[formId] = {};
        }

        if (state.forms[formId][field]) {
          state.forms[formId][field]!.refCount++;
        } else {
          state.forms[formId][field] = {
            refCount: 1,
            value: undefined,
            hydrated: false,
            valueUpdatePromise: undefined,
            resolveValueUpdate: undefined,
          };
        }
      }),

    unregister: (formId, field) =>
      set((state) => {
        const formState = state.forms?.[formId];
        const fieldState = formState?.[field];
        if (!fieldState) return;

        fieldState.refCount--;
        if (fieldState.refCount === 0) delete formState[field];
      }),

    getField: (formId, field) => {
      return get().forms?.[formId]?.[field];
    },

    setValue: (formId, field, value) =>
      set((state) => {
        const fieldState = state.forms?.[formId]?.[field];
        if (!fieldState) return;

        fieldState.value = value;
        const promise = new Promise<void>((resolve) => {
          fieldState.resolveValueUpdate = resolve;
        });
        fieldState.valueUpdatePromise = promise;
      }),

    hydrateWithDefault: (formId, field, defaultValue) =>
      set((state) => {
        const fieldState = state.forms[formId][field];
        if (!fieldState) return;

        fieldState.value = defaultValue;
        fieldState.defaultValue = defaultValue;
        fieldState.hydrated = true;
      }),

    awaitValueUpdate: async (formId, field) => {
      await get().forms[formId][field]?.valueUpdatePromise;
    },

    reset: (formId) =>
      set((state) => {
        Object.values(state.forms[formId]).forEach((field) => {
          if (!field) return;
          field.value = field.defaultValue;
        });
      }),
  }))
);
