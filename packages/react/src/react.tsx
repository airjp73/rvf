import {
  ChangeEvent,
  ReactNode,
  RefCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FieldValues,
  ValidationBehaviorConfig,
  Validator,
  Rvf,
  createRvf,
  scopeRvf,
} from "@rvf/core";
import {
  StringToPathTuple,
  ValidStringPaths,
  ValidStringPathsToArrays,
  ValueAtPath,
  getPath,
} from "set-get";
import { getEventValue } from "./event";
import { useStore } from "zustand";

export type FieldProps<Value> = {
  defaultValue: Value;
  onChange: (eventOrValue?: ChangeEvent<any> | Value) => void;
  onBlur: () => void;
  ref: RefCallback<HTMLElement>;
};

export type ControlProps<Value> = {
  value: Value;
  onChange: (eventOrValue?: ChangeEvent<any> | Value) => void;
  onBlur: () => void;
  ref: RefCallback<HTMLElement>;
};

export type CheckboxProps = {
  checked: boolean;
  onChange: (eventOrValue?: ChangeEvent<any> | boolean) => void;
  onBlur: () => void;
  ref: RefCallback<HTMLElement>;
};

export type RvfOpts<FormInputData extends FieldValues, FormOutputData> = {
  /**
   * The initial values of the form.
   * It's recommended that you provide a default value for every field in the form.
   */
  initialValues: FormInputData;

  /**
   * A function that validates the form's values.
   * This is most commonly used in combination with an adapter for a particular validation library like `zod`.
   */
  validator: Validator<FormInputData, FormOutputData>;

  /**
   * Handles the submission of the form.
   * This will be called when `form.handleSubmit` is called.
   */
  onSubmit: NoInfer<(data: FormOutputData) => Promise<void>>;

  /**
   * Allows you to customize the validation behavior of the form.
   */
  validationBehaviorConfig?: ValidationBehaviorConfig;
};

type MinimalRvf<FieldPaths extends string> = {
  touched: (fieldName: FieldPaths) => boolean;
};

export type FormFields<Form> =
  Form extends MinimalRvf<infer FieldPaths> ? FieldPaths : never;

export interface RvfArray<FormInputData extends Array<any>> {
  /**
   * Gets the length of the array.
   * @willRerender
   */
  length: () => number;

  /**
   * Maps over and renders the array items.
   * Using the `form` parameter passed to the callback will isolate rerenders to each individual item.
   * Changes to the length of the array will also be isoated to this `map` call.
   */
  map: (
    callback: (
      key: string,
      form: RvfReact<FormInputData[number]>,
      index: number,
    ) => ReactNode,
  ) => ReactNode;

  /**
   * Adds an item to the array. Just like `Array.push`.
   */
  push: (value: FormInputData[number]) => void;

  /**
   * Pops the last item in the array. Similar to `Array.pop`.
   */
  pop: () => void;

  /**
   * Removes the first item in the array. Similar to `Array.shift`.
   */
  shift: () => void;

  /**
   * Inserts an item at the start of the array. Just like `Array.unshift`.
   */
  unshift: (value: FormInputData[number]) => void;

  /**
   * Inserts an item at a specific index in the array.
   */
  insert: (index: number, value: FormInputData[number]) => void;

  /**
   * Moves an item from `fromIndex` to `toIndex` in the array.
   * This process happens by removing the item at `fromIndex` and inserting it at `toIndex`.
   * Keep this in mind if your `toIndex` is after the `fromIndex`.
   */
  move: (fromIndex: number, toIndex: number) => void;

  /**
   * Removes an item from the array.
   */
  remove: (index: number) => void;

  /**
   * Swaps the items at `fromIndex` and `toIndex` in the array.
   */
  swap: (fromIndex: number, toIndex: number) => void;

  /**
   * Replaces an item in the array.
   * The new value will be treated as a new field, which will reset any `touched`, `dirty`, or `validationErrors` for the item.
   * It will also generate a new key for the item.
   */
  replace: (index: number, value: FormInputData[number]) => void;
}

interface BaseRvfReact<FormInputData> {
  /**
   * Gets whether the field has been touched.
   * @willRerender
   */
  touched: (fieldName: ValidStringPaths<FormInputData>) => boolean;

  /**
   * Gets whether the field has been dirty.
   * @willRerender
   */
  dirty: (fieldName: ValidStringPaths<FormInputData>) => boolean;

  /**
   * Gets the current error for the field if any.
   * @willRerender
   */
  error: (fieldName: ValidStringPaths<FormInputData>) => string | undefined;

  /**
   * Gets the current value of the entire form.
   * If using a scoped form, this will be the value of the scoped form.
   * @willRerender
   */
  value(): FormInputData;

  /**
   * Gets the current value of the specified field.
   * @willRerender
   */
  value<Field extends ValidStringPaths<FormInputData>>(
    fieldName: Field,
  ): ValueAtPath<FormInputData, StringToPathTuple<Field>>;

  /**
   * Transient versions of a few other helpers that do not cause rerenders.
   */
  transient: {
    /**
     * Gets whether the field has been touched.
     */
    touched: (fieldName: ValidStringPaths<FormInputData>) => boolean;

    /**
     * Gets whether the field has been dirty.
     */
    dirty: (fieldName: ValidStringPaths<FormInputData>) => boolean;

    /**
     * Gets the current error for the field if any.
     */
    error: (fieldName: ValidStringPaths<FormInputData>) => string | undefined;

    /**
     * Gets the current value of the entire form.
     * If using a scoped form, this will be the value of the scoped form.
     */
    value(): FormInputData;

    /**
     * Gets the current value of the specified field.
     */
    value<Field extends ValidStringPaths<FormInputData>>(
      fieldName: Field,
    ): ValueAtPath<FormInputData, StringToPathTuple<Field>>;
  };

  /**
   * Various subscription helpers. These should be used in an effect and do not cause rerenders.
   */
  subscribe: {
    /**
     * Subscribes to any change in the values of the form.
     * @returns A function that can be called to unsubscribe.
     * @example `useEffect(() => form.subscribe.value(console.log), [])`
     */
    value(callback: (values: FormInputData) => void): () => void;

    /**
     * Subscribes to any change in value of the specified field.
     * @returns A function that can be called to unsubscribe.
     * @example `useEffect(() => form.subscribe.value('myfield', console.log), [])`
     */
    value<Field extends ValidStringPaths<FormInputData>>(
      fieldName: Field,
      callback: (
        values: ValueAtPath<FormInputData, StringToPathTuple<Field>>,
      ) => void,
    ): () => void;
  };

  /**
   * Focus the field with the specified name.
   * This only works if the `ref` provided by `field`, `control`, or `checkbox` was passed to a focusable element.
   */
  focus: (fieldName: ValidStringPaths<FormInputData>) => void;

  /**
   * Sets the value of the field with the specified name.
   * This works for both controlled and uncontrolled fields.
   * For uncontrolled fields, this will manually set the value of the form control using the `ref` returned by `field`.
   */
  setValue: <Field extends ValidStringPaths<FormInputData>>(
    fieldName: Field,
    value: ValueAtPath<FormInputData, StringToPathTuple<Field>>,
  ) => void;

  /**
   * Manually validates the form.
   * You usually don't need to do this.
   */
  validate: () => Promise<Record<string, string>>;

  /**
   * Resets the form to its initial state.
   * All fields will be reset to their initial values.
   * All touched, dirty, and validation errors will be reset.
   * Optionally, you can provide new initial values to reset.
   */
  reset: (nextValues?: FormInputData) => void;

  /**
   * Resets the field with the specified name to its initial value.
   * This also resets any touched, dirty, or validation errors for the field.
   * This works for both controlled and uncontrolled fields.
   * For uncontrolled fields, this will manually set the value of the form control using the `ref` returned by `field`.
   */
  resetField: (
    fieldName: ValidStringPaths<FormInputData>,
    nextValue?: unknown,
  ) => void;

  /**
   * Creates an `Rvf` scoped to the specified field.
   * This is useful for creating subforms.
   * In order to use this, you can pass it to `useRvf`.
   *
   * @example
   * ```tsx
   * type PersonFormProps = {
   *   rvf: Rvf<{ name: string }>;
   * }
   *
   * const PersonForm = ({ rvf }: PersonFormProps) => {
   *   const form = useRvf(rvf);
   *   return (
   *     <div>
   *       <MyInputField lable="Name" {...personForm.field('name')} />
   *     </div>
   *   );
   * };
   *
   * const LargerForm = () => {
   *   const form = useRvf({
   *     initialValues: {
   *       person: {
   *         name: "",
   *       },
   *     },
   *     // ... other options
   *   });
   *   return (
   *     <div>
   *       <PersonForm rvf={form.scope('person')} />
   *     </div>
   *   );
   * }
   * ```
   */
  scope<Field extends ValidStringPaths<FormInputData>>(
    fieldName: Field,
  ): Rvf<ValueAtPath<FormInputData, StringToPathTuple<Field>>>;

  /**
   * Returns an `Rvf` without scoping any further.
   */
  scope(): Rvf<FormInputData>;
}

interface IsolatableRvf {}

export interface RvfReact<FormInputData>
  extends BaseRvfReact<FormInputData>,
    IsolatableRvf {
  /**
   * Can be used to isolate rerenders in your forms.
   * This renders a component.
   *
   * @example
   * ```tsx
   * const MyForm = () => {
   *   const form = useRvf({
   *     initialValues: {
   *       foo: "bar",
   *       baz: "quux",
   *     },
   *     // ... other options
   *   });
   *   return (
   *     <div>
   *       {/* This controlled field will rerender the entire form. *\/}
   *       <MyInputField lable="Foo" {...form.control('foo')} />
   *
   *       {/* This controlled field will only rerender what's inside the isolate call. *\/}
   *       {form.isolate((islated) => (
   *         <MyInputField lable="Baz" {...isolated.control('baz')} />
   *       )}
   *     </div>
   *   );
   * };
   */
  isolate: (callback: (form: this) => ReactNode) => ReactNode;

  /**
   * Get array helpers for the form.
   * This is only useful if you're using a form that has been scoped to an array.
   */
  array(
    _no_args: FormInputData extends Array<any> ? void : never,
  ): FormInputData extends Array<any> ? RvfArray<FormInputData> : never;

  /**
   * Get array helpers for the specified field array.
   */
  array<Field extends ValidStringPathsToArrays<FormInputData>>(
    fieldName: Field,
  ): ValueAtPath<FormInputData, StringToPathTuple<Field>> extends Array<any>
    ? RvfArray<ValueAtPath<FormInputData, StringToPathTuple<Field>>>
    : never;

  /**
   * Registers an uncontrolled field.
   * It's recommended only to use this with native form controls, or components that are thin wrappers around native form controls.
   * It's important that the `ref` returned by this is passed to a form control.
   */
  field<Field extends ValidStringPaths<FormInputData>>(
    fieldName: Field,
  ): FieldProps<ValueAtPath<FormInputData, StringToPathTuple<Field>>>;

  /**
   * Registers an uncontrolled field using the value the form is currently scoped to.
   * This is most useful within `array.map` calls.
   */
  field(): FieldProps<FormInputData>;

  /**
   * Convenience helper for using checkboxes as boolean flags. Registers a checkbox as a controlled field.
   */
  checkbox<Field extends ValidStringPaths<FormInputData>>(
    fieldName: Field,
  ): CheckboxProps;

  /**
   * Registers a controlled field.
   * This can be used with any custom form controls or even native form controls.
   * The form will render every time the value of the field changes,
   * so only use this for small forms or make sure your using `form.isolate` to isolate rerenders.
   */
  control<Field extends ValidStringPaths<FormInputData>>(
    fieldName: Field,
  ): FieldProps<ValueAtPath<FormInputData, StringToPathTuple<Field>>>;

  /**
   * Registers an uncontrolled field using the value the form is currently scoped to.
   * This is most useful within `array.map` calls.
   */
  control(): FieldProps<FormInputData>;

  /**
   * Pass this to your form's `onSubmit` handler.
   */
  handleSubmit: (maybeEvent?: unknown) => void;
}

export const useBaseRvf = <FormInputData,>(form: Rvf<FormInputData>) => {
  const prefix = form.__field_prefix__;
  const { useStoreState } = form.__store__;
  const trackedState = useStoreState();

  // Accessing _something_ is required. Otherwise, it will rerender on every state update.
  // I saw this done in one of the dia-shi's codebases, too, but I can't find it now.
  trackedState.setValue;

  const base = useMemo((): BaseRvfReact<FormInputData> => {
    const f = (fieldName: string) =>
      prefix ? `${prefix}.${fieldName}` : fieldName;
    const getState = () => form.__store__.store.getState();

    return {
      value: (fieldName?: string) =>
        fieldName == null
          ? trackedState.values
          : (getPath(trackedState.values, f(fieldName)) as any),
      touched: (fieldName: string) => trackedState.touchedFields[f(fieldName)],
      dirty: (fieldName: string) => trackedState.dirtyFields[f(fieldName)],
      error: (fieldName) => {
        if (
          trackedState.submitStatus !== "idle" ||
          trackedState.touchedFields[f(fieldName)] ||
          trackedState.validationBehaviorConfig.initial === "onChange"
        )
          return trackedState.validationErrors[f(fieldName)];
        return undefined;
      },

      transient: {
        value: (fieldName?: string) =>
          fieldName == null
            ? getState().values
            : (getPath(getState().values, f(fieldName)) as any),
        touched: (fieldName: string) => getState().touchedFields[fieldName],
        dirty: (fieldName: string) => getState().dirtyFields[fieldName],
        error: (fieldName: string) => getState().validationErrors[fieldName],
      },

      subscribe: {
        value: (...args: unknown[]) => {
          type BothParams = [string | undefined, (value: unknown) => void];
          const [fieldName, callback] = (
            args.length === 1 ? [undefined, args[0]] : args
          ) as BothParams;

          return form.__store__.store.subscribe((state, prevState) => {
            const value = fieldName
              ? getPath(state.values, fieldName)
              : state.values;
            const prevValue = fieldName
              ? getPath(prevState.values, fieldName)
              : prevState.values;
            if (prevValue === value) return;
            callback(value as FormInputData);
          });
        },
      },

      setValue: (fieldName, value) => getState().setValue(f(fieldName), value),

      focus: (fieldName) => {
        const element =
          form.__store__.transientFieldRefs.getRef(f(fieldName)) ??
          form.__store__.controlledFieldRefs.getRef(f(fieldName));
        if (element && "focus" in element) element.focus();
      },

      validate: () => form.__store__.store.getState().validate(),
      reset: (...args) =>
        form.__store__.store.getState().reset(...(args as any)),
      resetField: (fieldName, nextValue) =>
        form.__store__.store.getState().resetField(f(fieldName), nextValue),

      scope: (fieldName?: string) =>
        fieldName == null ? form : (scopeRvf(form, fieldName) as any),
    };
  }, [form, prefix, trackedState]);

  return [base, trackedState] as const;
};

const IsolatedMap = ({
  form,
  render,
}: {
  form: Rvf<unknown>;
  render: (form: string[]) => ReactNode;
}) => {
  const keys = useStore(form.__store__.store, (state) =>
    state.getFieldArrayKeys(form.__field_prefix__),
  );
  return render(keys);
};

const useFormInternal = <FormInputData extends FieldValues>(
  form: Rvf<FormInputData>,
): RvfReact<FormInputData> => {
  const prefix = form.__field_prefix__;
  const [base, trackedState] = useBaseRvf(form);

  return useMemo((): RvfReact<FormInputData> => {
    const f = (fieldName?: string) =>
      [prefix, fieldName].filter(Boolean).join(".");

    const transientState = () => form.__store__.store.getState();

    const arrayImplCache = new Map<string, RvfArray<any>>();

    const arrayImpl = (fieldName?: string): RvfArray<any> => {
      const existingImpl = arrayImplCache.get(f(fieldName));
      if (existingImpl) return existingImpl;

      const impl: RvfArray<any> = {
        length: () => trackedState.getFieldArrayKeys(f(fieldName)).length,
        map: (callback) => {
          return (
            <IsolatedMap
              form={base.scope(fieldName as any)}
              render={(keys) =>
                keys.map((key, index) => {
                  const item = (base as any).scope(
                    [fieldName, String(index)].filter(Boolean).join("."),
                  ) as Rvf<FormInputData[number]>;

                  return (
                    <IsolatedFormUpdates
                      key={key}
                      form={item}
                      render={(itemForm) => callback(key, itemForm, index)}
                    />
                  );
                })
              }
            />
          );
        },
        push: (value) => trackedState.arrayPush(f(fieldName), value),
        pop: () => trackedState.arrayPop(f(fieldName)),
        shift: () => trackedState.arrayShift(f(fieldName)),
        unshift: (value) => trackedState.arrayUnshift(f(fieldName), value),
        insert: (index, value) =>
          trackedState.arrayInsert(f(fieldName), index, value),
        move: (fromIndex, toIndex) =>
          trackedState.arrayMove(f(fieldName), fromIndex, toIndex),
        remove: (index) => trackedState.arrayRemove(f(fieldName), index),
        swap: (fromIndex, toIndex) =>
          trackedState.arraySwap(f(fieldName), fromIndex, toIndex),
        replace: (index, value) =>
          trackedState.arrayReplace(f(fieldName), index, value),
      };

      arrayImplCache.set(f(fieldName), impl);
      return impl;
    };

    return {
      ...base,

      array: arrayImpl as any,

      field: (fieldName?: string) =>
        ({
          // We use the current value here in order to default to the correct value
          // in the case where an input unmounts after modification, then re-mounts
          defaultValue: getPath(transientState().values, f(fieldName)),
          onChange: (eventOrValue: unknown) =>
            transientState().onFieldChange(
              f(fieldName),
              getEventValue(eventOrValue),
            ),
          onBlur: () => transientState().onFieldBlur(f(fieldName)),
          ref: (element) =>
            form.__store__.transientFieldRefs.setRef(f(fieldName), element),
        }) satisfies FieldProps<unknown> as any,

      checkbox: (fieldName) => {
        return {
          // We use the current value here in order to default to the correct value
          // in the case where an input unmounts after modification, then re-mounts
          checked: Boolean(getPath(trackedState.values, f(fieldName))),
          onChange: (eventOrValue: unknown) =>
            trackedState.onFieldChange(
              f(fieldName),
              getEventValue(eventOrValue),
            ),
          onBlur: () => trackedState.onFieldBlur(f(fieldName)),
          ref: (element) =>
            form.__store__.transientFieldRefs.setRef(f(fieldName), element),
        } satisfies CheckboxProps as any;
      },

      control: (fieldName?: string) => {
        return {
          // We use the current value here in order to default to the correct value
          // in the case where an input unmounts after modification, then re-mounts
          value: getPath(trackedState.values, f(fieldName)),
          onChange: (eventOrValue: unknown) =>
            trackedState.onFieldChange(
              f(fieldName),
              getEventValue(eventOrValue),
            ),
          onBlur: () => trackedState.onFieldBlur(f(fieldName)),
          ref: (element) =>
            form.__store__.controlledFieldRefs.setRef(f(fieldName), element),
        } satisfies ControlProps<unknown> as any;
      },

      handleSubmit: (maybeEvent) => {
        if (maybeEvent instanceof Event) {
          maybeEvent.preventDefault();
        }
        trackedState.onSubmit();
      },

      isolate: (callback) => (
        <IsolatedFormUpdates form={form} render={callback} />
      ),
    };
  }, [base, form, prefix, trackedState]);
};

const IsolatedFormUpdates = <Form extends Rvf<any>>({
  form,
  render,
}: {
  form: Form;
  render: (form: RvfReact<Form["__type__FormInputData"]>) => ReactNode;
}) => {
  const isolated = useFormInternal(form);
  return render(isolated);
};

const isRvf = (form: any): form is Rvf<any> =>
  "__brand__" in form && form.__brand__ === "rvf";

/**
 * Create and use an `Rvf`.
 */
export function useRvf<FormInputData extends FieldValues, FormOutputData>(
  options: RvfOpts<FormInputData, FormOutputData>,
): RvfReact<FormInputData>;

/**
 * Interprets an `Rvf` created via `form.scope`, for use in a subcomponent.
 */
export function useRvf<FormInputData>(
  form: Rvf<FormInputData>,
): RvfReact<FormInputData>;

export function useRvf<FormInputData extends FieldValues, FormOutputData>(
  optsOrForm: RvfOpts<FormInputData, FormOutputData> | Rvf<FormInputData>,
): RvfReact<FormInputData> {
  const [form] = useState<Rvf<FormInputData>>(() => {
    if ("__brand__" in optsOrForm) return optsOrForm;
    return createRvf({
      initialValues: optsOrForm.initialValues,
      validator: optsOrForm.validator,
      onSubmit: optsOrForm.onSubmit,
      validationBehaviorConfig: optsOrForm.validationBehaviorConfig,
    });
  });

  const validator = isRvf(optsOrForm) ? undefined : optsOrForm.validator;
  const onSubmit = isRvf(optsOrForm) ? undefined : optsOrForm.onSubmit;
  const isWholeForm = isRvf(optsOrForm);

  useEffect(() => {
    if (isWholeForm) return;

    Object.assign(form.__store__.mutableImplStore, {
      validator: validator as any,
      onSubmit,
    });
  }, [validator, onSubmit, isWholeForm, form.__store__.mutableImplStore]);

  return useFormInternal(form);
}
