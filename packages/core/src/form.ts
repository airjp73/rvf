import { FieldValues, ValidationBehaviorConfig, Validator } from "./types";
import {
  FormStoreValue,
  MutableImplStore,
  RefStore,
  createFormStateStore,
  createRefStore,
} from "./store";
import { createTrackedSelector } from "react-tracked";

type SubmitTypes<FormOutputData> =
  | {
      submitSource: "state";
      onSubmit: (data: FormOutputData) => Promise<void>;
    }
  | {
      submitSource: "dom";
      onSubmit: (data: FormOutputData, formData: FormData) => Promise<void>;
    };

type FormInit<FormInputData extends FieldValues, FormOutputData> = {
  defaultValues: FormInputData;
  validator: Validator<FormInputData, FormOutputData>;
  validationBehaviorConfig?: ValidationBehaviorConfig;
  onSubmit: (data: FormOutputData) => Promise<void>;
} & SubmitTypes<FormOutputData>;

export interface Rvf<FormInputData> {
  __brand__: "rvf";
  __type__FormInputData: FormInputData;
  __field_prefix__: string;
  __store__: RvfStore;
}

interface RvfStore {
  transientFieldRefs: RefStore;
  controlledFieldRefs: RefStore;
  formRef: { current: HTMLFormElement | null };
  mutableImplStore: MutableImplStore;
  store: ReturnType<typeof createFormStateStore>;
  useStoreState: () => FormStoreValue;
  subformCache: Map<string, any>;
}

export const createRvf = <FormInputData extends FieldValues, FormOutputData>({
  defaultValues,
  validator,
  onSubmit,
  validationBehaviorConfig,
  submitSource,
}: FormInit<FormInputData, FormOutputData>): Rvf<FormInputData> => {
  const transientFieldRefs = createRefStore();
  const controlledFieldRefs = createRefStore();
  const formRef = { current: null as HTMLFormElement | null };
  const mutableImplStore = { validator, onSubmit } satisfies MutableImplStore;
  const store = createFormStateStore({
    defaultValues,
    transientFieldRefs,
    controlledFieldRefs,
    formRef,
    submitSource,
    mutableImplStore,
    validationBehaviorConfig,
  });
  const subformCache = new Map<string, any>();

  const rvfStore: RvfStore = {
    transientFieldRefs,
    controlledFieldRefs,
    formRef,
    mutableImplStore,
    store,
    subformCache,
    useStoreState: createTrackedSelector(store),
  };

  return instantiateRvf<FormInputData>(rvfStore, "");
};

const instantiateRvf = <FormInputData extends FieldValues>(
  store: RvfStore,
  prefix: string,
): Rvf<FormInputData> => ({
  __brand__: "rvf",
  __type__FormInputData: {} as any,
  __field_prefix__: prefix,
  __store__: store,
});

export const scopeRvf = (
  parentForm: Rvf<unknown>,
  prefix: string,
): Rvf<unknown> => {
  const newPrefix = parentForm.__field_prefix__
    ? `${parentForm.__field_prefix__}.${prefix}`
    : prefix;
  if (parentForm.__store__.subformCache.has(newPrefix))
    return parentForm.__store__.subformCache.get(newPrefix);

  const scoped = {
    ...parentForm,
    __field_prefix__: newPrefix,
  } as any;
  parentForm.__store__.subformCache.set(newPrefix, scoped);

  return scoped;
};
