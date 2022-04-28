import invariant from "tiny-invariant";
import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { storeFamily } from "./storeFamily";

export type ControlledFieldState = {
  fields: {
    [fieldName: string]: {
      refCount: number;
      value: unknown;
      defaultValue?: unknown;
      hydrated: boolean;
      valueUpdatePromise: Promise<void> | undefined;
      resolveValueUpdate: (() => void) | undefined;
    };
  };
  register: (fieldName: string) => void;
  unregister: (fieldName: string) => void;
  setValue: (fieldName: string, value: unknown) => void;
  hydrateWithDefault: (fieldName: string, defaultValue: unknown) => void;
  awaitValueUpdate: (fieldName: string) => Promise<void>;
  reset: () => void;
};

export const controlledFieldStore = storeFamily(() =>
  create<ControlledFieldState>()(
    immer((set, get, api) => ({
      fields: {},

      register: (field) =>
        set((state) => {
          if (state.fields[field]) {
            state.fields[field].refCount++;
          } else {
            state.fields[field] = {
              refCount: 1,
              value: undefined,
              hydrated: false,
              valueUpdatePromise: undefined,
              resolveValueUpdate: undefined,
            };
          }
        }),

      unregister: (field) =>
        set((state) => {
          invariant(
            state.fields[field],
            "Attempted to unregister a field that isn't registered. This is probably a bug in remix-validated-form."
          );

          state.fields[field].refCount--;
          if (state.fields[field].refCount === 0) delete state.fields[field];
        }),

      setValue: (field, value) =>
        set((state) => {
          invariant(
            state.fields[field],
            "Attempted to update the value of a controlled field that isn't registered. This is probably a bug in remix-validated-form."
          );

          state.fields[field].value = value;
          const promise = new Promise<void>((resolve) => {
            state.fields[field].resolveValueUpdate = resolve;
          });
          state.fields[field].valueUpdatePromise = promise;
        }),

      hydrateWithDefault: (field, defaultValue) =>
        set((state) => {
          invariant(
            state.fields[field],
            "Attempted to update the value of a controlled field that isn't registered. This is probably a bug in remix-validated-form."
          );

          state.fields[field].value = defaultValue;
          state.fields[field].defaultValue = defaultValue;
          state.fields[field].hydrated = true;
        }),

      awaitValueUpdate: async (field) => {
        await get().fields[field]?.valueUpdatePromise;
      },

      reset: () =>
        set((state) => {
          Object.values(state.fields).forEach((field) => {
            field.value = field.defaultValue;
          });
        }),
    }))
  )
);
