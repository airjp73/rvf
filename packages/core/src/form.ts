import { FieldValues, ValidationBehaviorConfig, Validator } from "./types";
import {
  FormStoreValue,
  MutableImplStore,
  RefStore,
  createFormStateStore,
  createRefStore,
} from "./store";
import { createTrackedSelector } from "react-tracked";

type FormInit<FormInputData extends FieldValues, FormOutputData> = {
  initialValues: FormInputData;
  validator: Validator<FormInputData, FormOutputData>;
  onSubmit: (data: FormOutputData) => Promise<void>;
  validationBehaviorConfig?: ValidationBehaviorConfig;
};

export interface Rvf<FormInputData> {
  __brand__: "rvf";
  __type__FormInputData: FormInputData;
  __field_prefix__: string;
  __store__: RvfStore;
}

interface RvfStore {
  transientFieldRefs: RefStore;
  controlledFieldRefs: RefStore;
  mutableImplStore: MutableImplStore;
  store: ReturnType<typeof createFormStateStore>;
  useStoreState: () => FormStoreValue;
  subformCache: Map<string, any>;
}

export const createRvf = <FormInputData extends FieldValues, FormOutputData>({
  initialValues,
  validator,
  onSubmit,
  validationBehaviorConfig,
}: FormInit<FormInputData, FormOutputData>): Rvf<FormInputData> => {
  const transientFieldRefs = createRefStore();
  const controlledFieldRefs = createRefStore();
  const mutableImplStore = { validator, onSubmit } satisfies MutableImplStore;
  const store = createFormStateStore({
    initialValues,
    transientFieldRefs,
    controlledFieldRefs,
    mutableImplStore,
    validationBehaviorConfig,
  });
  const subformCache = new Map<string, any>();

  const rvfStore: RvfStore = {
    transientFieldRefs,
    controlledFieldRefs,
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
