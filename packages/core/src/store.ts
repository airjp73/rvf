import {
  setPath,
  getPath,
  stringToPathArray,
  pathArrayToString,
} from "set-get";
import { create } from "zustand/react";
import { immer } from "./immer";
import * as R from "remeda";
import {
  setFormControlValue,
  focusOrReportFirst,
  getElementsWithNames,
} from "./dom";
import {
  FieldErrors,
  FieldValues,
  SubmitStatus,
  ValidationBehavior,
  ValidationBehaviorConfig,
  Validator,
} from "./types";
import { GenericObject } from "./native-form-data/flatten";
import { MultiValueMap } from "./native-form-data/MultiValueMap";
import { insert, move, remove, replace, toSwapped } from "./arrayUtil";

export const createRefStore = () => {
  const elementRefs = new MultiValueMap<string, HTMLElement>();
  const symbolMaps = new Map<symbol, HTMLElement>();
  return {
    has: (name: string) => elementRefs.has(name),
    getRefs: (fieldName: string) => elementRefs.getAll(fieldName),
    removeRef: (fieldName: string, symbol?: symbol) => {
      if (symbol) {
        const el = symbolMaps.get(symbol);
        symbolMaps.delete(symbol);
        if (!el)
          throw new Error("Ref symbol not found. This is likely a bug in RVF");
        elementRefs.remove(fieldName, el);
        return;
      }
      elementRefs.delete(fieldName);
    },
    setRef: (fieldName: string, ref: HTMLElement, symbol?: symbol) => {
      if (symbol) symbolMaps.set(symbol, ref);
      elementRefs.add(fieldName, ref);
    },
    forEach: (callback: (fieldName: string, ref: HTMLElement | null) => void) =>
      [...elementRefs.entries()].forEach(([fieldName, refs]) =>
        refs.forEach((ref) => callback(fieldName, ref)),
      ),
    all: () => [...elementRefs.entries()],
  };
};
export type RefStore = ReturnType<typeof createRefStore>;

export type StoreFormProps = {
  action?: string;
  id: string;
};

export type StoreFlags = {
  disableFocusOnError: boolean;
};

type StoreState = {
  values: FieldValues;
  defaultValues: FieldValues;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
  validationErrors: Record<string, string>;
  submitStatus: SubmitStatus;
  fieldArrayKeys: Record<string, Array<string>>;
  arrayUpdateKeys: Record<string, string>;
  validationBehaviorConfig: ValidationBehaviorConfig;
  submitSource: "state" | "dom";
  formProps: StoreFormProps;
  flags: StoreFlags;
};

type StoreEvents = {
  onFieldChange: (
    fieldName: string,
    value: unknown,
    validationBehaviorConfig?: ValidationBehaviorConfig,
  ) => void;
  onFieldBlur: (
    fieldName: string,
    validationBehaviorConfig?: ValidationBehaviorConfig,
  ) => void;
  onSubmit: (submitterData?: Record<string, string>) => void;
};

type StoreActions = {
  setValue: (fieldName: string, value: unknown) => void;
  setTouched: (fieldName: string, value: boolean) => void;
  setDirty: (fieldName: string, value: boolean) => void;
  setError: (fieldName: string, value: string | null) => void;

  setAllValues: (data: FieldValues) => void;
  setAllTouched: (data: Record<string, boolean>) => void;
  setAllDirty: (data: Record<string, boolean>) => void;
  setAllErrors: (data: Record<string, string>) => void;

  shouldValidate: (
    eventType: ValidationBehavior,
    fieldName: string,
    validationBehaviorConfig?: ValidationBehaviorConfig,
  ) => boolean;
  validate: (
    nextValues?: FieldValues,
    shouldMarkSubmitted?: boolean,
  ) => Promise<
    | { data: GenericObject; errors: undefined }
    | { errors: Record<string, string>; data: undefined }
  >;

  syncOptions: (opts: {
    submitSource: "state" | "dom";
    validationBehaviorConfig?: ValidationBehaviorConfig | undefined;
    formProps: StoreFormProps;
    flags: StoreFlags;
  }) => void;

  syncServerValidtionErrors: (errors: FieldErrors) => void;

  reset: (nextValues?: FieldValues) => void;
  resetField: (fieldName: string, nextValue?: unknown) => void;

  getFieldArrayKeys: (fieldName: string) => Array<string>;
  arrayPush: (fieldName: string, value: unknown) => void;
  arrayPop: (fieldName: string) => void;
  arrayShift: (fieldName: string) => void;
  arrayUnshift: (fieldName: string, value: unknown) => void;
  arrayInsert: (fieldName: string, index: number, value: unknown) => void;
  arrayMove: (fieldName: string, fromIndex: number, toIndex: number) => void;
  arrayRemove: (fieldName: string, index: number) => void;
  arraySwap: (fieldName: string, fromIndex: number, toIndex: number) => void;
  arrayReplace: (fieldName: string, index: number, value: unknown) => void;
};

export type FormStoreValue = StoreState & StoreEvents & StoreActions;

type StateSubmitter = (data: any) => void | Promise<void>;
type DomSubmitter = (data: any, formData: FormData) => void | Promise<void>;
export type MutableImplStore = {
  validator: Validator<any>;
  onSubmit: StateSubmitter | DomSubmitter;
};

const defaultValidationBehaviorConfig: ValidationBehaviorConfig = {
  initial: "onBlur",
  whenTouched: "onChange",
  whenSubmitted: "onChange",
};

export type FormStoreInit = {
  defaultValues: Record<PropertyKey, unknown>;
  transientFieldRefs: RefStore;
  controlledFieldRefs: RefStore;
  formRef: { current: HTMLFormElement | null };
  submitSource: "state" | "dom";
  mutableImplStore: MutableImplStore;
  validationBehaviorConfig?: ValidationBehaviorConfig;
  formProps: StoreFormProps;
  flags: StoreFlags;
  serverValidationErrors: FieldErrors;
};

const genKey = () => `${Math.round(Math.random() * 10_000)}-${Date.now()}`;

const setPathIfUndefined = (
  obj: Record<string, any>,
  path: string,
  value: any,
) => {
  const val = getPath(obj, path);
  if (val === undefined) setPath(obj, path, value);
};

export const renameFlatFieldStateKeys = <Obj extends Record<string, any>>(
  obj: Obj,
  path: string,
  updater: (key: string) => string,
) => {
  const newObj: Record<string, any> = {};
  const removeKeys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith(path)) {
      newObj[updater(key)] = value;
      removeKeys.push(key);
    }
  }

  removeKeys.forEach((key) => delete obj[key]);
  Object.assign(obj, newObj);
};

export const deleteFieldsWithPrefix = (
  prefixObjects: Record<string, any>[],
  path: string,
) => {
  for (const obj of prefixObjects) {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith(path)) {
        delete obj[key];
      }
    }
  }
};

export const moveFieldArrayKeys = (
  objs: Record<string, any>[],
  fieldName: string,
  updater: (index: number) => number,
) => {
  objs.forEach((obj) => {
    renameFlatFieldStateKeys(obj, fieldName, (key) => {
      if (key === fieldName) return key;
      const suffix = key.replace(`${fieldName}`, "");
      const parts = stringToPathArray(suffix);
      const index = Number(parts.shift());
      if (Number.isNaN(index))
        throw new Error("Attempted to update a non-array field");
      const newIndex = updater(index);
      return pathArrayToString([fieldName, newIndex, ...parts]);
    });
  });
};

export const createFormStateStore = ({
  defaultValues,
  controlledFieldRefs,
  transientFieldRefs,
  mutableImplStore,
  formRef,
  submitSource,
  validationBehaviorConfig = defaultValidationBehaviorConfig,
  formProps,
  flags,
  serverValidationErrors = {},
}: FormStoreInit) =>
  create<FormStoreValue>()(
    immer((set, get) => ({
      /////// State
      values: defaultValues,
      defaultValues,
      touchedFields: {},
      dirtyFields: {},
      validationErrors: serverValidationErrors,
      // If we have default errors, lets treat that as a failed server-side validation
      submitStatus:
        Object.keys(serverValidationErrors).length > 0 ? "error" : "idle",
      fieldArrayKeys: {},
      arrayUpdateKeys: {},
      validationBehaviorConfig,
      submitSource,
      formProps,
      flags,

      /////// Validation
      shouldValidate: (eventType, fieldName, behaviorOverride) => {
        if (eventType === "onSubmit") return true;

        const config = behaviorOverride ?? get().validationBehaviorConfig;
        const currentValidationBehavior =
          get().submitStatus !== "idle"
            ? config.whenSubmitted
            : get().touchedFields[fieldName]
              ? config.whenTouched
              : config.initial;

        if (eventType === "onBlur")
          return (
            currentValidationBehavior === "onBlur" ||
            currentValidationBehavior === "onChange"
          );

        return currentValidationBehavior === "onChange";
      },

      validate: async (nextValues, shouldMarkSubmitted = false) => {
        const result = await mutableImplStore.validator.validate(
          nextValues ?? get().values,
        );

        if (result.data) {
          set((state) => {
            state.validationErrors = {};
          });
          return { data: result.data, errors: undefined };
        }

        const errors = result.error?.fieldErrors ?? {};

        set((state) => {
          state.validationErrors = errors;
          if (shouldMarkSubmitted) state.submitStatus = "error";
        });

        return { errors, data: undefined };
      },

      /////// Events
      onFieldChange: (fieldName, value, validationBehaviorConfig) => {
        set((state) => {
          setPath(state.values, fieldName, value);
          state.dirtyFields[fieldName] = true;
        });

        if (
          get().shouldValidate("onChange", fieldName, validationBehaviorConfig)
        ) {
          get().validate();
        } else {
          get().setError(fieldName, null);
        }
      },

      onFieldBlur: (fieldName, validationBehaviorConfig) => {
        set((state) => {
          state.touchedFields[fieldName] = true;
        });

        if (
          get().shouldValidate("onBlur", fieldName, validationBehaviorConfig)
        ) {
          get().validate();
        }
      },

      onSubmit: async (submitterData) => {
        const { disableFocusOnError } = get().flags;
        set((state) => {
          state.submitStatus = "submitting";
        });

        const getValues = (): GenericObject | FormData => {
          if (get().submitSource === "state") return get().values;

          const form = formRef.current;
          if (!form)
            throw new Error(
              "`submitSource` is set to `dom`, but no form is registered with RVF.",
            );

          const formData = new FormData(form);
          if (submitterData) {
            Object.entries(submitterData).forEach(([key, value]) => {
              formData.append(key, value);
            });
          }
          return formData;
        };

        const rawValues = getValues();
        const result = await get().validate(rawValues, true);

        if (result.errors && !disableFocusOnError) {
          const refElementsWithErrors = Object.keys(result.errors)
            .flatMap((fieldName) => [
              ...transientFieldRefs.getRefs(fieldName),
              ...controlledFieldRefs.getRefs(fieldName),
            ])
            .filter((val): val is NonNullable<typeof val> => val != null);

          if (formRef.current) {
            const unRegisteredNames = Object.keys(result.errors).filter(
              (name) =>
                !transientFieldRefs.has(name) && !controlledFieldRefs.has(name),
            );
            const otherErrorElements = getElementsWithNames(
              unRegisteredNames,
              formRef.current!,
            );
            refElementsWithErrors.push(...otherErrorElements);
          }

          focusOrReportFirst(refElementsWithErrors);

          return;
        }

        try {
          if (get().submitSource === "state") {
            await (mutableImplStore.onSubmit as StateSubmitter)(result.data);
          } else
            await (mutableImplStore.onSubmit as DomSubmitter)(
              result.data,
              rawValues as FormData, // should be FormData in this case
            );
          set((state) => {
            state.submitStatus = "success";
          });
        } catch (err) {
          set((state) => {
            state.submitStatus = "error";
          });
        }
      },

      /////// Actions
      syncOptions: ({
        submitSource,
        validationBehaviorConfig = defaultValidationBehaviorConfig,
        formProps,
        flags,
      }) => {
        set((state) => {
          state.submitSource = submitSource;
          state.validationBehaviorConfig = validationBehaviorConfig;
          state.formProps = formProps;
          state.flags = flags;
        });
      },

      syncServerValidtionErrors: (errors) => {
        set((state) => {
          state.validationErrors = errors;
          state.submitStatus = "error";
        });
      },

      setValue: (fieldName, value) => {
        set((state) => {
          if (fieldName) setPath(state.values, fieldName, value);
          else state.values = value as any;
        });

        transientFieldRefs.getRefs(fieldName).forEach((ref) => {
          setFormControlValue(ref, value);
        });
      },

      setAllValues: (data) => {
        set((state) => {
          state.values = data;
        });
      },

      setTouched: (fieldName, value) => {
        set((state) => {
          state.touchedFields[fieldName] = value;
        });
      },

      setDirty: (fieldName, value) => {
        set((state) => {
          state.dirtyFields[fieldName] = value;
        });
      },

      setError: (fieldName, value) => {
        set((state) => {
          if (value == null) delete state.validationErrors[fieldName];
          else state.validationErrors[fieldName] = value;
        });
      },

      setAllTouched: (data) => {
        set((state) => {
          state.touchedFields = data;
        });
      },

      setAllDirty: (data) => {
        set((state) => {
          state.dirtyFields = data;
        });
      },

      setAllErrors: (data) => {
        set((state) => {
          state.validationErrors = data;
        });
      },

      ///////// Other actions
      reset: (nextValues = get().defaultValues) => {
        set((state) => {
          state.values = nextValues;
          state.defaultValues = nextValues;
          state.touchedFields = {};
          state.dirtyFields = {};
          state.validationErrors = {};
          state.fieldArrayKeys = {};
          state.arrayUpdateKeys = {};
          state.submitStatus = "idle";
        });

        transientFieldRefs.forEach((fieldName, ref) => {
          if (!ref) return;
          setFormControlValue(ref, getPath(nextValues, fieldName));
        });
      },

      resetField: (
        fieldName,
        nextValue = getPath(get().defaultValues, fieldName),
      ) => {
        set((state) => {
          setPath(state.values, fieldName, nextValue);
          deleteFieldsWithPrefix(
            [
              state.touchedFields,
              state.validationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
            ],
            fieldName,
          );
          state.arrayUpdateKeys[fieldName] = genKey();
        });

        transientFieldRefs.forEach((fieldName, ref) => {
          if (!ref) return;
          setFormControlValue(ref, nextValue);
        });
      },

      ///////// Arrays
      getFieldArrayKeys: (fieldName) => {
        const currentKeys = get().fieldArrayKeys[fieldName];
        if (currentKeys) return currentKeys;

        const valueInState = getPath(get().values, fieldName) as unknown;
        const value = valueInState === undefined ? [] : valueInState; // only default `undefined` to empty array, not `null`
        if (!Array.isArray(value)) {
          console.warn(
            "Tried to treat a non-array as an array. Make sure you used the correct field name and set a default value.",
          );
          return [];
        }

        const newKeys = value.map(() => genKey());

        queueMicrotask(() => {
          set((state) => {
            state.fieldArrayKeys[fieldName] = newKeys;
          });
        });

        return newKeys;
      },

      arrayPush: (fieldName, value) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val)) throw new Error("Can't push to a non-array");
          val.push(value);

          state.fieldArrayKeys[fieldName]?.push(genKey());
          state.arrayUpdateKeys[fieldName] = genKey();
          // no change to touched, dirty, or validationErrors
        });
      },
      arrayPop: (fieldName) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val))
            throw new Error("Can't pop from a non-array");
          const numItems = val.length;
          val.pop();
          state.fieldArrayKeys[fieldName]?.pop();
          state.arrayUpdateKeys[fieldName] = genKey();
          deleteFieldsWithPrefix(
            [
              state.touchedFields,
              state.validationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
            ],
            `${fieldName}[${numItems - 1}]`,
          );
        });
      },
      arrayShift: (fieldName) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val))
            throw new Error("Can't shift from a non-array");
          val.shift();
          state.fieldArrayKeys[fieldName]?.shift();
          state.arrayUpdateKeys[fieldName] = genKey();

          deleteFieldsWithPrefix(
            [
              state.touchedFields,
              state.validationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
            ],
            `${fieldName}[0]`,
          );
          moveFieldArrayKeys(
            [
              state.touchedFields,
              state.validationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
            ],
            fieldName,
            (index) => index - 1,
          );
        });
      },
      arrayUnshift: (fieldName, value) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val))
            throw new Error("Can't unshift to a non-array");

          val.unshift(value);
          state.fieldArrayKeys[fieldName]?.unshift(genKey());
          state.arrayUpdateKeys[fieldName] = genKey();
          moveFieldArrayKeys(
            [
              state.touchedFields,
              state.validationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
            ],
            fieldName,
            (index) => index + 1,
          );
        });
      },
      arrayInsert: (fieldName, insertAtIndex, value) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val))
            throw new Error("Can't insert to a non-array");

          insert(val, insertAtIndex, value);
          insert(state.fieldArrayKeys[fieldName], insertAtIndex, genKey());
          state.arrayUpdateKeys[fieldName] = genKey();

          moveFieldArrayKeys(
            [
              state.touchedFields,
              state.validationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
            ],
            fieldName,
            (index) => (index >= insertAtIndex ? index + 1 : index),
          );
        });
      },
      arrayMove: (fieldName, fromIndex, toIndex) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val))
            throw new Error("Can't move from a non-array");

          move(val, fromIndex, toIndex);
          move(state.fieldArrayKeys[fieldName], fromIndex, toIndex);
          state.arrayUpdateKeys[fieldName] = genKey();

          moveFieldArrayKeys(
            [
              state.touchedFields,
              state.validationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
            ],
            fieldName,
            (index) => {
              if (index === fromIndex) return toIndex;
              let res = index;
              if (index > fromIndex) res--;
              if (res >= toIndex) res++;
              return res;
            },
          );
        });
      },
      arrayRemove: (fieldName, removeIndex) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val))
            throw new Error("Can't remove from a non-array");

          remove(val, removeIndex);
          remove(state.fieldArrayKeys[fieldName], removeIndex);
          state.arrayUpdateKeys[fieldName] = genKey();

          deleteFieldsWithPrefix(
            [
              state.touchedFields,
              state.validationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
            ],
            `${fieldName}[${removeIndex}]`,
          );
          moveFieldArrayKeys(
            [
              state.touchedFields,
              state.validationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
            ],
            fieldName,
            (index) => (index > removeIndex ? index - 1 : index),
          );
        });
      },
      arraySwap: (fieldName, fromIndex, toIndex) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val))
            throw new Error("Can't swap from a non-array");

          setPath(state.values, fieldName, toSwapped(val, fromIndex, toIndex));

          if (state.fieldArrayKeys[fieldName]) {
            state.fieldArrayKeys[fieldName] = toSwapped(
              state.fieldArrayKeys[fieldName],
              fromIndex,
              toIndex,
            );
          }

          state.arrayUpdateKeys[fieldName] = genKey();

          moveFieldArrayKeys(
            [
              state.touchedFields,
              state.validationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
            ],
            fieldName,
            (index) => {
              if (index === fromIndex) return toIndex;
              if (index === toIndex) return fromIndex;
              return index;
            },
          );
        });
      },
      arrayReplace: (fieldName, index, value) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val))
            throw new Error("Can't replace from a non-array");

          replace(val, index, value);
          replace(state.fieldArrayKeys[fieldName], index, genKey());
          state.arrayUpdateKeys[fieldName] = genKey();

          // Treat a replacement as a reset / new field at the same index.
          deleteFieldsWithPrefix(
            [
              state.touchedFields,
              state.validationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
            ],
            `${fieldName}[${index}]`,
          );
        });
      },
    })),
  );
