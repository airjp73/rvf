import {
  setPath,
  getPath,
  stringToPathArray,
  mergePathStrings,
} from "@rvf/set-get";
import { create } from "zustand/react";
import { immer } from "./immer";
import {
  setFormControlValue,
  focusOrReport,
  getElementsWithNames,
} from "./dom/dom";
import {
  FieldArrayValidationBehavior,
  FieldArrayValidationBehaviorConfig,
  FieldErrors,
  FieldValues,
  SubmitStatus,
  ValidationBehavior,
  ValidationBehaviorConfig,
  Validator,
} from "./types";
import { GenericObject, preprocessFormData } from "./native-form-data/flatten";
import { MultiValueMap } from "./native-form-data/MultiValueMap";
import { insert, move, remove, replace, toSwapped } from "./arrayUtil";
import { getFieldDefaultValue, getFieldValue } from "./getters";

export type FieldSerializer = (value: unknown) => string;

export const createRefStore = <Data>() => {
  const elementRefs = new MultiValueMap<string, Data>();
  const symbolMaps = new Map<symbol, Data>();
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
    setRef: (fieldName: string, ref: Data, symbol?: symbol) => {
      if (symbol) symbolMaps.set(symbol, ref);
      elementRefs.add(fieldName, ref);
    },
    forEach: (callback: (fieldName: string, ref: Data | null) => void) =>
      [...elementRefs.entries()].forEach(([fieldName, refs]) =>
        refs.forEach((ref) => callback(fieldName, ref)),
      ),
    all: () => [...elementRefs.entries()],
    names: () => [...elementRefs.keys()],
  };
};

export type BeforeSubmitApi<
  FormInputData = unknown,
  FormOutputData = unknown,
> = {
  /**
   * The data inside the form before validations are run.
   */
  unvalidatedData: FormInputData;
  /**
   * Runs the validations and returns the validated data.
   * If the form is not valid, it will throw an error.
   */
  getValidatedData: () => Promise<FormOutputData>;
  /**
   * Get's the raw `FormData` object.
   * This is only available when `submitSource` is set to `dom`.
   */
  getFormData: () => FormData;
  /**
   * Cancels the form submission and sets the submit status to `error`.
   *
   * This is intended for advanced use-cases.
   * By using this, you're taking control of the submission lifecycle.
   * `onSubmitFailure` will _not_ be called as a result of this.
   */
  cancelSubmit: () => never;
  /**
   * This is intended for advanced use-cases.
   * By using this, you're taking control of the submission lifecycle.
   *
   * Manually invokes the `handleSubmit` function,
   * allowing you to customize the data that is submitted.
   * This will not trigger any validations, so make sure to use `getValidatedData`
   * if you want to run validations before submitting.
   */
  performSubmit: (data: FormOutputData) => Promise<void>;
  /**
   * The options passed to the form submission by the submitter.
   * This usually comes from props passed to your submit button,
   * but can also be passed to when calling `submit` manually.
   */
  submitterOptions: SubmitterOptions;
};

export type RefStore<Data = HTMLElement> = ReturnType<
  typeof createRefStore<Data>
>;

const withResolvers = () => {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {
    promise,
    resolve: resolve as never as () => void,
    reject: reject as never as () => void,
  };
};

export const createResolverQueue = () => {
  const resolvers = new Set<() => void>();

  const queueResolver = () => {
    const { promise, resolve } = withResolvers();
    resolvers.add(resolve);
    return promise as Promise<void>;
  };

  return {
    queue: queueResolver,
    flush: () => {
      resolvers.forEach((resolve) => resolve());
      resolvers.clear();
    },

    /**
     * Waits for any pending updates to resolve if there are any.
     * Does not queue any resolvers if there are none.
     */
    await: () => {
      const res = resolvers.size > 0 ? queueResolver() : Promise.resolve();
      return res;
    },
  };
};

export type ResolverQueue = ReturnType<typeof createResolverQueue>;

export type StoreFormProps = {
  action?: string;
  id?: string;
};

export type StoreFlags = {
  disableFocusOnError: boolean;
  reloadDocument: boolean;
};

class CancelSubmitError extends Error {}

type StoreState = {
  values: FieldValues;
  defaultValues: FieldValues;
  defaultValueOverrides: Record<string, unknown>;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
  validationErrors: Record<string, string>;
  customValidationErrors: Record<string, string>;
  submitStatus: SubmitStatus;
  fieldArrayKeys: Record<string, Array<string>>;
  arrayUpdateKeys: Record<string, string>;
  validationBehaviorConfig: ValidationBehaviorConfig;
  submitSource: "state" | "dom";
  formProps: StoreFormProps;
  flags: StoreFlags;
  defaultFormId: string;
};

export type SubmitterOptions = {
  formEnctype?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formAction?: string;
};

export type ResetFieldOpts = { defaultValue?: unknown };

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
  onSubmit: (
    submitterData?: Record<string, string>,
    submitterOptions?: SubmitterOptions,
  ) => void;
};

type StoreActions = {
  setValue: (fieldName: string, value: unknown) => void;
  setTouched: (fieldName: string, value: boolean) => void;
  setDirty: (fieldName: string, value: boolean) => void;
  setError: (fieldName: string, value: string | null) => void;
  setCustomError: (fieldName: string, value: string | null) => void;

  setAllValues: (data: FieldValues) => void;
  setAllTouched: (data: Record<string, boolean>) => void;
  setAllDirty: (data: Record<string, boolean>) => void;
  setAllErrors: (data: Record<string, string>) => void;

  getFormValuesForValidation: (opts?: {
    /**
     * String data that should be injected into the form data object before preprocessing.
     */
    injectedData?: Record<string, string>;
  }) => [GenericObject, FormData] | [GenericObject];
  shouldValidate: (
    eventType: ValidationBehavior,
    fieldName: string,
    validationBehaviorConfig?: ValidationBehaviorConfig,
  ) => boolean;
  shouldValidateArray: (
    eventType: FieldArrayValidationBehavior,
    validationBehaviorConfig?: FieldArrayValidationBehaviorConfig,
  ) => boolean;
  maybeValidateArrayOperation: (
    fieldName: string,
    validationBehaviorConfig?: FieldArrayValidationBehaviorConfig,
  ) => void;
  validate: (
    nextValues?: FieldValues,
    shouldMarkSubmitted?: boolean,
  ) => Promise<
    | { data: GenericObject; errors: undefined }
    | { errors: Record<string, string>; data: undefined }
  >;
  validateField: (
    fieldName: string,
  ) => Promise<
    | { data: GenericObject; errors: undefined }
    | { errors: Record<string, string>; data: undefined }
  >;
  focusFirstInvalidField: () => void;

  syncOptions: (opts: {
    submitSource: "state" | "dom";
    validationBehaviorConfig?: ValidationBehaviorConfig | undefined;
    formProps: StoreFormProps;
    flags: StoreFlags;
  }) => void;

  syncServerValidationErrors: (errors: FieldErrors) => void;

  reset: (nextValues?: FieldValues) => void;
  resetField: (fieldName: string, opts?: ResetFieldOpts) => void;

  getFieldArrayKeys: (fieldName: string) => Array<string>;
  arrayPush: (
    fieldName: string,
    value: unknown,
    validationBehavior?: FieldArrayValidationBehaviorConfig,
  ) => void;
  arrayPop: (
    fieldName: string,
    validationBehavior?: FieldArrayValidationBehaviorConfig,
  ) => void;
  arrayShift: (
    fieldName: string,
    validationBehavior?: FieldArrayValidationBehaviorConfig,
  ) => void;
  arrayUnshift: (
    fieldName: string,
    value: unknown,
    validationBehavior?: FieldArrayValidationBehaviorConfig,
  ) => void;
  arrayInsert: (
    fieldName: string,
    index: number,
    value: unknown,
    validationBehavior?: FieldArrayValidationBehaviorConfig,
  ) => void;
  arrayMove: (
    fieldName: string,
    fromIndex: number,
    toIndex: number,
    validationBehavior?: FieldArrayValidationBehaviorConfig,
  ) => void;
  arrayRemove: (
    fieldName: string,
    index: number,
    validationBehavior?: FieldArrayValidationBehaviorConfig,
  ) => void;
  arraySwap: (
    fieldName: string,
    fromIndex: number,
    toIndex: number,
    validationBehavior?: FieldArrayValidationBehaviorConfig,
  ) => void;
  arrayReplace: (
    fieldName: string,
    index: number,
    value: unknown,
    validationBehavior?: FieldArrayValidationBehaviorConfig,
  ) => void;
};

export type FormStoreValue = StoreState & StoreEvents & StoreActions;

export type StateSubmitHandler<Data = any, ResponseData = any> = (
  data: Data,
  submitterOptions: SubmitterOptions,
) => void | Promise<ResponseData>;
export type DomSubmitHandler<Data = any, ResponseData = any> = (
  data: Data,
  formData: FormData,
  submitterOptions: SubmitterOptions,
) => void | Promise<ResponseData>;

export type MutableImplStore = {
  validator: Validator<any>;
  onSubmit: StateSubmitHandler | DomSubmitHandler;
  onSubmitSuccess: (responseData: unknown) => void | Promise<void>;
  onSubmitFailure: (error: unknown) => void | Promise<void>;
  onBeforeSubmit: (beforeSubmitApi: BeforeSubmitApi) => void | Promise<void>;
  onInvalidSubmit: () => void | Promise<void>;
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
  fieldSerializerRefs: RefStore<FieldSerializer>;
  resolvers: ResolverQueue;
  formRef: { current: HTMLFormElement | null };
  submitSource: "state" | "dom";
  mutableImplStore: MutableImplStore;
  validationBehaviorConfig?: ValidationBehaviorConfig;
  formProps: StoreFormProps;
  flags: StoreFlags;
  serverValidationErrors: FieldErrors;
  defaultFormId: string;
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
        throw new Error(`Attempted to update a non-array field, ${fieldName}`);
      const newIndex = updater(index);
      return mergePathStrings(fieldName, newIndex, ...parts);
    });
  });
};

export const toArrayBehavior = (
  config?: ValidationBehaviorConfig,
): FieldArrayValidationBehaviorConfig => {
  return {
    initial:
      config?.initial === "onBlur"
        ? "onSubmit"
        : (config?.initial ?? "onSubmit"),
    whenSubmitted:
      config?.whenSubmitted === "onBlur"
        ? "onSubmit"
        : (config?.whenSubmitted ?? "onChange"),
  };
};

export const createFormStateStore = ({
  defaultValues,
  controlledFieldRefs,
  transientFieldRefs,
  fieldSerializerRefs,
  resolvers,
  mutableImplStore,
  formRef,
  submitSource,
  validationBehaviorConfig = defaultValidationBehaviorConfig,
  formProps,
  flags,
  serverValidationErrors = {},
  defaultFormId,
}: FormStoreInit) =>
  create<FormStoreValue>()(
    immer((set, get) => ({
      /////// State
      values: defaultValues,
      defaultValues,
      defaultValueOverrides: {},
      touchedFields: {},
      dirtyFields: {},
      validationErrors: serverValidationErrors,
      customValidationErrors: {},
      // If we have default errors, lets treat that as a failed server-side validation
      submitStatus:
        Object.keys(serverValidationErrors).length > 0 ? "error" : "idle",
      fieldArrayKeys: {},
      arrayUpdateKeys: {},
      validationBehaviorConfig,
      submitSource,
      formProps: {
        ...formProps,
        id: formProps.id,
      },
      defaultFormId,
      flags,

      /////// Validation
      getFormValuesForValidation: ({ injectedData } = {}) => {
        if (get().submitSource === "state")
          return [{ ...get().values, ...injectedData }];

        const form = formRef.current;
        if (!form)
          throw new Error(
            "`submitSource` is set to `dom`, but no form is registered with RVF.",
          );

        const formData = new FormData(form);
        if (injectedData) {
          Object.entries(injectedData)
            .filter(([key, value]) => !!key && !!value)
            .forEach(([key, value]) => {
              formData.set(key, value);
            });
        }

        const preprocessed = preprocessFormData(formData);

        return [preprocessed, formData] as const;
      },
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

      shouldValidateArray: (eventType, behaviorOverride) => {
        if (eventType === "onSubmit") return true;

        const config =
          behaviorOverride ?? toArrayBehavior(get().validationBehaviorConfig);

        const currentValidationBehavior =
          get().submitStatus !== "idle" ? config.whenSubmitted : config.initial;

        return currentValidationBehavior === "onChange";
      },

      maybeValidateArrayOperation: async (fieldName, behaviorOverride) => {
        if (get().submitSource === "dom") {
          await resolvers.queue();
        }

        if (get().shouldValidateArray("onChange", behaviorOverride)) {
          get().validateField(fieldName);
        } else {
          get().setError(fieldName, null);
        }
      },

      validate: async (nextValues, shouldMarkSubmitted = false) => {
        if (get().submitSource === "dom") {
          await resolvers.await();
        }

        const result = await mutableImplStore.validator.validate(
          nextValues ?? get().getFormValuesForValidation()[0],
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

      validateField: async (fieldName) => {
        const serializedData: Record<string, string> = {};

        if (get().submitSource === "dom") {
          const state = get();
          const controlledFieldNames = new Set(controlledFieldRefs.names());

          fieldSerializerRefs.all().forEach(([fieldName, serializers]) => {
            if (serializers.length > 1) {
              console.error(
                "RVF: Multiple serializers for a single field are not supported",
              );
            }

            const serializer = serializers[0];
            serializedData[fieldName] = serializer(
              getFieldValue(state, fieldName),
            );
            controlledFieldNames.delete(fieldName);
          });

          await resolvers.await();
        }

        const [values] = get().getFormValuesForValidation({
          injectedData: serializedData,
        });
        const validationResult =
          await mutableImplStore.validator.validate(values);

        if (validationResult.data) {
          // Only update the field errors if it hasn't changed
          if (Object.keys(get().validationErrors).length > 0) {
            set((state) => {
              state.validationErrors = {};
            });
          }
          return { data: validationResult.data, errors: undefined };
        }

        const fieldErrors = validationResult.error?.fieldErrors ?? {};
        const errorFields = new Set<string>();
        const incomingErrors = new Set<string>();
        const prevErrors = new Set<string>();

        Object.keys(fieldErrors).forEach((field) => {
          errorFields.add(field);
          incomingErrors.add(field);
        });

        Object.keys(get().validationErrors).forEach((field) => {
          errorFields.add(field);
          prevErrors.add(field);
        });

        const fieldsToUpdate = new Set<string>();
        const fieldsToDelete = new Set<string>();

        errorFields.forEach((field) => {
          // If an error has been cleared, remove it.
          if (!incomingErrors.has(field)) {
            fieldsToDelete.add(field);
            return;
          }

          // If an error has changed, we should update it.
          if (prevErrors.has(field) && incomingErrors.has(field)) {
            // Only update if the error has changed to avoid unnecessary rerenders
            if (fieldErrors[field] !== get().validationErrors[field])
              fieldsToUpdate.add(field);
            return;
          }

          // If the error is always included, then we should update it.
          if (fieldName === field) {
            fieldsToUpdate.add(field);
            return;
          }

          // If the error is new, then only update if the field has
          // or if the form has been submitted
          if (!prevErrors.has(field)) {
            get().shouldValidate;
            const fieldTouched = get().touchedFields[field];
            const formHasBeenSubmitted = get().submitStatus !== "idle";
            if (fieldTouched || formHasBeenSubmitted) fieldsToUpdate.add(field);
            return;
          }
        });
        if (fieldsToDelete.size === 0 && fieldsToUpdate.size === 0) {
          return {
            ...validationResult,
            error: { fieldErrors: get().validationErrors },
          };
        }

        set((state) => {
          fieldsToDelete.forEach((field) => {
            delete state.validationErrors[field];
          });

          fieldsToUpdate.forEach((field) => {
            state.validationErrors[field] = fieldErrors[field];
          });
        });

        return {
          ...validationResult,
          error: { fieldErrors: get().validationErrors },
        };
      },

      focusFirstInvalidField: () => {
        const {
          validationErrors,
          customValidationErrors,
          flags: { disableFocusOnError },
        } = get();
        if (disableFocusOnError) return;

        const allErrors = {
          ...validationErrors,
          ...customValidationErrors,
        };
        const refElementsWithErrors = Object.keys(allErrors)
          .flatMap((fieldName) => [
            ...transientFieldRefs.getRefs(fieldName),
            ...controlledFieldRefs.getRefs(fieldName),
          ])
          .filter((val): val is NonNullable<typeof val> => val != null);

        if (formRef.current) {
          const unRegisteredNames = Object.keys(allErrors).filter(
            (name) =>
              !transientFieldRefs.has(name) && !controlledFieldRefs.has(name),
          );
          const otherErrorElements = getElementsWithNames(
            unRegisteredNames,
            formRef.current!,
          );
          refElementsWithErrors.push(...otherErrorElements);
        }

        focusOrReport(refElementsWithErrors);
      },

      /////// Events
      onFieldChange: (fieldName, value, validationBehaviorConfig) => {
        set((state) => {
          setPath(state.values, fieldName, value);
          const defaultValue = getFieldDefaultValue(state, fieldName);
          state.dirtyFields[fieldName] = value !== defaultValue;
          deleteFieldsWithPrefix([state.fieldArrayKeys], fieldName);
        });

        if (
          get().submitSource === "dom" &&
          controlledFieldRefs.has(fieldName) &&
          !fieldSerializerRefs.has(fieldName)
        ) {
          void resolvers.queue();
        }

        if (
          get().shouldValidate("onChange", fieldName, validationBehaviorConfig)
        ) {
          get().validateField(fieldName);
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
          get().validateField(fieldName);
        }
      },

      onSubmit: async (submitterData, submitterOptions = {}) => {
        set((state) => {
          state.submitStatus = "submitting";
        });

        const [rawValues, formData] = get().getFormValuesForValidation({
          injectedData: submitterData,
        });

        const doValidation = () => get().validate(rawValues, true);
        let result: Awaited<ReturnType<typeof doValidation>> | undefined =
          undefined;

        const runSubmission = async (data: unknown) => {
          try {
            let response: unknown;
            if (get().submitSource === "state") {
              response = await (
                mutableImplStore.onSubmit as StateSubmitHandler
              )(data, submitterOptions);
            } else {
              if (!formData)
                throw new Error(
                  "Missing form data. This is likely a bug in RVF",
                );
              response = await (mutableImplStore.onSubmit as DomSubmitHandler)(
                data,
                formData,
                submitterOptions,
              );
            }

            try {
              await mutableImplStore.onSubmitSuccess?.(response);
            } finally {
              set((state) => {
                state.submitStatus = "success";
              });
            }
          } catch (err) {
            try {
              await mutableImplStore.onSubmitFailure?.(err);
            } finally {
              set((state) => {
                state.submitStatus = "error";
              });
            }
          }
        };

        let submitted = false;

        try {
          await mutableImplStore.onBeforeSubmit?.({
            unvalidatedData: rawValues,
            getValidatedData: async () => {
              result = await doValidation();
              if (result.errors) {
                throw new CancelSubmitError();
              }
              return result.data;
            },
            getFormData: () => {
              if (!formData) {
                throw new Error(
                  "FormData can only be accessed when `submitSource` is set to `dom`",
                );
              }
              return formData;
            },
            cancelSubmit: () => {
              throw new CancelSubmitError();
            },
            performSubmit: async (data) => {
              submitted = true;
              await runSubmission(data);
            },
            submitterOptions,
          });
        } catch (err) {
          try {
            if (!(err instanceof CancelSubmitError)) {
              console.error(err);
              await mutableImplStore.onSubmitFailure?.(err);
            }
          } finally {
            set((state) => {
              state.submitStatus = "error";
            });
          }
          return;
        }

        if (submitted) return;

        if (!result) result = await doValidation();

        if (
          result.errors ||
          Object.entries(get().customValidationErrors).length > 0
        ) {
          get().focusFirstInvalidField();
          await mutableImplStore.onInvalidSubmit?.();
          if (get().submitStatus === "submitting")
            set((state) => {
              state.submitStatus = "error";
            });
          return;
        }

        if (get().flags.reloadDocument) {
          const form = formRef.current;

          if (!form)
            throw new Error(
              "Can't use reloadDocument without a native form element",
            );
          if (submitSource !== "dom")
            throw new Error(
              "Can't use reloadDocument with the state submit source",
            );

          form.submit();
          return;
        }

        await runSubmission(result.data);
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
          state.formProps = {
            ...formProps,
            id: formProps.id ?? state.formProps.id,
          };
          state.flags = flags;
        });
      },

      syncServerValidationErrors: (errors) => {
        if (errors === get().validationErrors) return;

        set((state) => {
          state.validationErrors = errors;
          state.submitStatus = "error";
        });
        get().focusFirstInvalidField();
      },

      setValue: (fieldName, value) => {
        set((state) => {
          if (fieldName) setPath(state.values, fieldName, value);
          else state.values = value as any;
          deleteFieldsWithPrefix([state.fieldArrayKeys], fieldName);
        });

        if (
          get().submitSource === "dom" &&
          controlledFieldRefs.has(fieldName) &&
          !fieldSerializerRefs.has(fieldName)
        ) {
          void resolvers.queue();
        }

        transientFieldRefs.getRefs(fieldName).forEach((ref) => {
          setFormControlValue(ref, value);
        });
      },

      setAllValues: (data) => {
        set((state) => {
          state.values = data;
        });

        if (get().submitSource === "dom") {
          void resolvers.queue();
        }
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

      setCustomError: (fieldName, value) => {
        set((state) => {
          if (value == null) delete state.customValidationErrors[fieldName];
          else state.customValidationErrors[fieldName] = value;
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
          state.defaultValueOverrides = {};
          state.touchedFields = {};
          state.dirtyFields = {};
          state.validationErrors = {};
          state.customValidationErrors = {};
          state.fieldArrayKeys = {};
          state.arrayUpdateKeys = {};
          state.submitStatus = "idle";
        });

        if (get().submitSource === "dom") {
          void resolvers.queue();
        }

        transientFieldRefs.forEach((fieldName, ref) => {
          if (!ref) return;
          setFormControlValue(ref, getPath(nextValues, fieldName));
        });
      },

      resetField: (fieldName, opts = {}) => {
        const currentDefaultValue = getFieldDefaultValue(get(), fieldName);

        const shouldOverrideDefaultValue = "defaultValue" in opts;
        const nextValue = shouldOverrideDefaultValue
          ? opts.defaultValue
          : currentDefaultValue;

        set((state) => {
          setPath(state.values, fieldName, nextValue);

          deleteFieldsWithPrefix(
            [
              state.touchedFields,
              state.validationErrors,
              state.customValidationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
              state.defaultValueOverrides,
            ],
            fieldName,
          );
          state.arrayUpdateKeys[fieldName] = genKey();

          if (shouldOverrideDefaultValue)
            state.defaultValueOverrides[fieldName] = opts.defaultValue;
        });

        if (
          get().submitSource === "dom" &&
          controlledFieldRefs.has(fieldName) &&
          !fieldSerializerRefs.has(fieldName)
        ) {
          void resolvers.queue();
        }

        transientFieldRefs.getRefs(fieldName).forEach((ref) => {
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

      arrayPush: (fieldName, value, validationBehaviorConfig) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val)) throw new Error("Can't push to a non-array");
          const previousLength = val.length;
          val.push(value);

          state.fieldArrayKeys[fieldName]?.push(genKey());
          state.arrayUpdateKeys[fieldName] = genKey();
          state.defaultValueOverrides[`${fieldName}[${previousLength}]`] =
            value;
          // no change to touched, dirty, or validationErrors
        });

        void get().maybeValidateArrayOperation(
          fieldName,
          validationBehaviorConfig,
        );
      },
      arrayPop: (fieldName, validationBehaviorConfig) => {
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
              state.customValidationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
              state.defaultValueOverrides,
            ],
            `${fieldName}[${numItems - 1}]`,
          );
        });
        void get().maybeValidateArrayOperation(
          fieldName,
          validationBehaviorConfig,
        );
      },
      arrayShift: (fieldName, validationBehaviorConfig) => {
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
              state.customValidationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
              state.defaultValueOverrides,
            ],
            `${fieldName}[0]`,
          );
          moveFieldArrayKeys(
            [
              state.touchedFields,
              state.validationErrors,
              state.customValidationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
              state.defaultValueOverrides,
            ],
            fieldName,
            (index) => index - 1,
          );
        });
        void get().maybeValidateArrayOperation(
          fieldName,
          validationBehaviorConfig,
        );
      },
      arrayUnshift: (fieldName, value, validationBehaviorConfig) => {
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
              state.customValidationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
              state.defaultValueOverrides,
            ],
            fieldName,
            (index) => index + 1,
          );
          state.defaultValueOverrides[`${fieldName}[0]`] = value;
        });
        void get().maybeValidateArrayOperation(
          fieldName,
          validationBehaviorConfig,
        );
      },
      arrayInsert: (
        fieldName,
        insertAtIndex,
        value,
        validationBehaviorConfig,
      ) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val))
            throw new Error("Can't insert to a non-array");

          insert(val, insertAtIndex, value);
          if (state.fieldArrayKeys[fieldName])
            insert(state.fieldArrayKeys[fieldName], insertAtIndex, genKey());
          state.arrayUpdateKeys[fieldName] = genKey();

          moveFieldArrayKeys(
            [
              state.touchedFields,
              state.validationErrors,
              state.customValidationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
              state.defaultValueOverrides,
            ],
            fieldName,
            (index) => (index >= insertAtIndex ? index + 1 : index),
          );
          state.defaultValueOverrides[`${fieldName}[${insertAtIndex}]`] = value;
        });
        void get().maybeValidateArrayOperation(
          fieldName,
          validationBehaviorConfig,
        );
      },
      arrayMove: (fieldName, fromIndex, toIndex, validationBehaviorConfig) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val))
            throw new Error("Can't move from a non-array");

          move(val, fromIndex, toIndex);
          if (state.fieldArrayKeys[fieldName])
            move(state.fieldArrayKeys[fieldName], fromIndex, toIndex);
          state.arrayUpdateKeys[fieldName] = genKey();

          moveFieldArrayKeys(
            [
              state.touchedFields,
              state.validationErrors,
              state.customValidationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
              state.defaultValueOverrides,
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
        void get().maybeValidateArrayOperation(
          fieldName,
          validationBehaviorConfig,
        );
      },
      arrayRemove: (fieldName, removeIndex, validationBehaviorConfig) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val))
            throw new Error("Can't remove from a non-array");

          remove(val, removeIndex);
          if (state.fieldArrayKeys[fieldName])
            remove(state.fieldArrayKeys[fieldName], removeIndex);
          state.arrayUpdateKeys[fieldName] = genKey();

          deleteFieldsWithPrefix(
            [
              state.touchedFields,
              state.validationErrors,
              state.customValidationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
              state.defaultValueOverrides,
            ],
            `${fieldName}[${removeIndex}]`,
          );
          moveFieldArrayKeys(
            [
              state.touchedFields,
              state.validationErrors,
              state.customValidationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
              state.defaultValueOverrides,
            ],
            fieldName,
            (index) => (index > removeIndex ? index - 1 : index),
          );
        });
        void get().maybeValidateArrayOperation(
          fieldName,
          validationBehaviorConfig,
        );
      },
      arraySwap: (fieldName, fromIndex, toIndex, validationBehaviorConfig) => {
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
              state.customValidationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
              state.defaultValueOverrides,
            ],
            fieldName,
            (index) => {
              if (index === fromIndex) return toIndex;
              if (index === toIndex) return fromIndex;
              return index;
            },
          );
        });
        void get().maybeValidateArrayOperation(
          fieldName,
          validationBehaviorConfig,
        );
      },
      arrayReplace: (fieldName, index, value, validationBehaviorConfig) => {
        set((state) => {
          setPathIfUndefined(state.values, fieldName, []);
          const val = getPath(state.values, fieldName);

          if (!Array.isArray(val))
            throw new Error("Can't replace from a non-array");

          replace(val, index, value);
          if (state.fieldArrayKeys[fieldName])
            replace(state.fieldArrayKeys[fieldName], index, genKey());
          state.arrayUpdateKeys[fieldName] = genKey();

          // Treat a replacement as a reset / new field at the same index.
          deleteFieldsWithPrefix(
            [
              state.touchedFields,
              state.validationErrors,
              state.customValidationErrors,
              state.dirtyFields,
              state.fieldArrayKeys,
              state.defaultValueOverrides,
            ],
            `${fieldName}[${index}]`,
          );
          state.defaultValueOverrides[`${fieldName}[${index}]`] = value;
        });
        void get().maybeValidateArrayOperation(
          fieldName,
          validationBehaviorConfig,
        );
      },
    })),
  );
