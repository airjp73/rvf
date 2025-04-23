import { useEffect, useState, useId, ComponentProps } from "react";
import * as h from "hotscript";
import {
  FieldValues,
  ValidationBehaviorConfig,
  Validator,
  FormScope,
  createFormScope,
  registerFormElementEvents,
  StateSubmitHandler,
  DomSubmitHandler,
  BeforeSubmitApi,
  withStandardSchema,
  // NonContradictingSupertype,
} from "@rvf/core";
import { FormApi, useFormInternal } from "./base";
import { FieldErrors } from "@rvf/core";
import { StandardSchemaV1 } from "@standard-schema/spec";

type Prettify<T> = {
  [K in keyof T]: T[K];
  // necessary for this type
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

// https://github.com/sindresorhus/type-fest/blob/44c1766504a2a5024f063ac83bc67d28ec52cba9/source/is-null.d.ts
type IsNull<T> = [T] extends [null] ? true : false;
// https://github.com/sindresorhus/type-fest/blob/44c1766504a2a5024f063ac83bc67d28ec52cba9/source/is-unknown.d.ts
type IsUnknown<T> = unknown extends T // `T` can be `unknown` or `any`
  ? IsNull<T> extends false // `any` can be `null`, but `unknown` can't be
    ? true
    : false
  : false;
// https://github.com/sindresorhus/type-fest/blob/86a3a6929f87948f708126083bfb760582e48989/source/is-never.d.ts#L42
type IsNever<T> = [T] extends [never] ? true : false;
interface IsNeverFn extends h.Fn {
  return: IsNever<this["arg0"]>;
}

type Tuple<T = any> = [...T[]];

interface HasMatchIn<T extends Tuple> extends h.Fn {
  return: h.Pipe<
    T,
    [
      h.Tuples.Find<h.Booleans.Equals<this["arg0"]>, T>,
      IsNeverFn,
      h.Booleans.Not,
    ]
  >;
}

type ToUnion<T extends Tuple> = h.Call<h.Tuples.ToUnion<T>>;

type ReconcileObjects<T extends object, U extends object> = {
  [K in keyof T | keyof U]: K extends keyof T
    ? K extends keyof U
      ? NonContradictingSupertype<T[K], U[K]>
      : T[K]
    : never;
};

interface NestedSupertypeFn extends h.Fn {
  return: this["arg0"] extends [infer one, infer two]
    ? NonContradictingSupertype<one, two>
    : never;
}

type ReconcileTuple<T extends Tuple, U extends Tuple> =
  h.Call<
    h.Booleans.Equals<h.Call<h.Tuples.Length<T>>, h.Call<h.Tuples.Length<U>>>
  > extends true
    ? h.Pipe<h.Call<h.Tuples.Zip<T, U>>, [h.Tuples.Map<NestedSupertypeFn>]>
    : T;

// prettier-ignore
type Reconcile<T, U> =
  T extends Primitive ? U extends Primitive
    ? T extends U ? U : T
    : T
  : T extends AnyReadStatus<[infer THead, ...infer TTail]>
    ? U extends AnyReadStatus<[infer UHead, ...infer UTail]>
      ? ReconcileTuple<[THead, ...TTail], [UHead, ...UTail]>
    : T
  : T extends AnyReadStatus<Array<infer TItem>>
    ? U extends AnyReadStatus<Array<infer UItem>>
      ? Array<NonContradictingSupertype<TItem, UItem>>
    : U extends AnyReadStatus<[infer UHead, ...infer UTail]>
      ? Array<NonContradictingSupertype<TItem, ToUnion<[UHead, ...UTail]>>>
    : T
  : T extends object
    ? U extends object ? ReconcileObjects<T, U>
    : T
  : T

type HandleDifferences<T extends Tuple, U extends Tuple> = T extends []
  ? ToUnion<U>
  : [T, U] extends [[infer TOnly], [infer UOnly]]
    ? Reconcile<TOnly, UOnly>
    : ToUnion<T>;

type Work<
  T,
  U,
  TTuple extends Tuple = h.Call<h.Unions.ToTuple, T>,
  UTuple extends Tuple = h.Call<h.Unions.ToTuple, U>,
> = [
  h.Pipe<TTuple, [h.Tuples.Partition<HasMatchIn<UTuple>>]>,
  h.Pipe<UTuple, [h.Tuples.Partition<HasMatchIn<TTuple>>]>,
] extends [
  [infer TExact, infer TDiff extends Tuple],
  [any, infer UDiff extends Tuple],
]
  ? h.Call<h.Tuples.ToUnion, TExact> | Prettify<HandleDifferences<TDiff, UDiff>>
  : never;

// NoInfer breaks distributiveness, but this appears to fix it.
// https://github.com/microsoft/TypeScript/issues/61076
type DistributiveNoInfer<T> = NoInfer<[T]>[0];

// /**
//  * Finds the least common supertype with some restrictions.
//  */
export type NonContradictingSupertype<T, U> =
  IsUnknown<T> extends true ? U : Prettify<Work<T, U>>;

type AnyReadStatus<T> = T | Readonly<T>;

type Primitive = string | number | boolean | symbol | bigint | null | undefined;

///////////

const noOp = () => {};

type FormSubmitOpts<FormOutputData, ResponseData> =
  | {
      submitSource: "state";
      handleSubmit: StateSubmitHandler<FormOutputData, ResponseData>;
    }
  | {
      submitSource?: "dom";
      handleSubmit?: DomSubmitHandler<FormOutputData, ResponseData>;
    };

export type internal_BaseFormOpts<
  FormInputData extends FieldValues = FieldValues,
  FormOutputData = never,
  SubmitResponseData = unknown,
> = {
  /**
   * Called before when the form is submitted before any validations are run.
   * Can be used to run custom, async validations and/or cancel the form submission.
   */
  onBeforeSubmit?: (
    beforeSubmitApi: BeforeSubmitApi<FormInputData, FormOutputData>,
  ) => void | Promise<void>;

  /**
   * Called after the form has been successfully submitted with whatever data was returned from the `handleSubmit` function.
   * Can be useful for showing a toast message or redirecting the user to a different page.
   * If you return a `Promise` from this callback, the `isSubmitting` state will still be `true` while this callback is running.
   *
   * If you''t using `handleSubmit`.
   */
  onSubmitSuccess?: (
    handleSubmitResponse: NoInfer<SubmitResponseData>,
  ) => void | Promise<void>;

  /**
   * Called when the `handleSubmit` function throws an error.
   * Can be useful for showing a toast message or redirecting the user to a different page.
   * If you return a `Promise` from this callback, the `isSubmitting` state will still be `true` while this callback is running.
   *
   * If you're using an adapter like `@rvf/react-router`, this will be called even if you aren't using `handleSubmit`.
   */
  onSubmitFailure?: (error: unknown) => void | Promise<void>;

  /**
   * Called when the user attempts to submit the form with invalid data.
   * This is called after the first invalid field is focused.
   * Can be useful if you want to take deeper control over how you handle invalid forms.
   */
  onInvalidSubmit?: () => void | Promise<void>;

  /**
   * A shortcut setting that resets the form to the default values after the form has been successfully submitted.
   * This is equivalent to calling `resetForm` in the `onSubmitSuccess` callback.
   */
  resetAfterSubmit?: boolean;

  /**
   * Allows you to customize the validation behavior of the form.
   */
  validationBehaviorConfig?: ValidationBehaviorConfig;

  /**
   * The action prop of the form element.
   * This will be automatically set on the form element if you use `getFormProps`.
   */
  action?: string;

  /**
   * The id of the form element.
   * This will be automatically set on the form element if you use `getFormProps`.
   */
  id?: string;

  /**
   * Disables the default behavior of focusing the first invalid field when a submit fails due to validation errors.
   */
  disableFocusOnError?: boolean;

  /**
   * When set to true, a valid form will be submitted natively with a full page reload.
   * _Note_: This is only supported in the `dom` submit source.
   */
  reloadDocument?: boolean;

  /**
   * Optionally, you can pass other props to the form element here.
   * This is primarily useful for writing custom hooks around `useForm`.
   * For most use-cases, you can simply pass the props directly to the form element.
   */
  otherFormProps?: Omit<ComponentProps<"form">, "id" | "action">;

  /**
   * Can be used to set the default errors of the entire form.
   * This is most useful went integrating with server-side validation.
   *
   * **CAREFUL**: this will cause an update every time the identity of `serverValidationErrors` changes.
   * So make sure the identity of `serverValidationErrors` is stable.
   */
  serverValidationErrors?: FieldErrors;
};

export type internal_ValidatorAndDefaultValueOpts<
  SchemaInput extends FieldValues,
  SchemaOutput,
  DefaultValues extends FieldValues,
  FormInputData extends FieldValues,
> =
  | ({
      /**
       * A validator object created by a validation adapter such a `withZod` or `withYup`.
       * See [these docs](https://rvf-js.io/validation-library-support) for more details
       * and information on how to create a validator for other validation libraries.
       *
       * This option is soft-deprecated. For libraries that support Standard Schema,
       * we recommend passing the schema directly to the `schema` option.
       * For `yup`, the `withYup` adapter will eventually return a Standard Schema intead of a custom validator.
       * If you have a custom adapter, we recommend using this approach as well, if the library doesn't support Standard Schema.
       */
      validator: Validator<SchemaOutput>;

      /**
       * Sets the default values of the form.
       *
       * For Typescript users, `defaultValues` is one of the most important props you'll use.
       * The type of the object you pass here, will determine the type of the data you get
       * when interacting with the form. For example, `form.value('myField')` will be typed based on
       * the type of `defaultValues.myField`.
       *
       * It's recommended that you provide a default value for every field in the form.
       */
      defaultValues?: FormInputData;
    } & { schema?: never })
  | ({
      /**
       * A [Standard Schema](https://standardschema.dev/) compliant schema.
       * The input type of this schema will be used to help make `defaultValues` typesafe,
       * as well as determine the types when using the `FormApi` returned from this hook.
       */
      schema: StandardSchemaV1<SchemaInput, SchemaOutput>;
      // Adding this intersection lets us still get the correct output inferred
      // even if `defaultValues` isn't provided yet
    } & {
      /**
       * Sets the default values of the form.
       *
       * For Typescript users, `defaultValues` is one of the most important props you'll use.
       * The type of the object you pass here, will determine the type of the data you get
       * when interacting with the form. For example, `form.value('myField')` will be typed based on
       * the type of `defaultValues.myField`.
       *
       * It's recommended that you provide a default value for every field in the form.
       */
      defaultValues: NonContradictingSupertype<
        DistributiveNoInfer<SchemaInput>,
        Readonly<DefaultValues>
      >;
    });

export type FormOpts<
  SchemaInput extends FieldValues = any,
  SchemaOutput = unknown,
  SubmitResponseData = unknown,
  DefaultValues extends FieldValues = SchemaInput,
  FormInputData extends FieldValues = NonContradictingSupertype<
    DistributiveNoInfer<SchemaInput>,
    DefaultValues
  >,
> = internal_ValidatorAndDefaultValueOpts<
  SchemaInput,
  SchemaOutput,
  DefaultValues,
  FormInputData
> &
  internal_BaseFormOpts<
    NoInfer<FormInputData>,
    NoInfer<SchemaOutput>,
    SubmitResponseData
  > &
  FormSubmitOpts<NoInfer<SchemaOutput>, SubmitResponseData>;

const maybeThen = <T,>(
  maybePromise: T | Promise<T>,
  then: (value: T) => void,
) => {
  if (maybePromise instanceof Promise) {
    return maybePromise.then(then);
  } else {
    return then(maybePromise);
  }
};

/**
 * Create and use a `FormScope`.
 */
export function useForm<
  SchemaInput extends FieldValues = any,
  SchemaOutput = unknown,
  SubmitResponseData = unknown,
  const DefaultValues extends FieldValues = SchemaInput,
  FormInputData extends FieldValues = NonContradictingSupertype<
    DistributiveNoInfer<SchemaInput>,
    DefaultValues
  >,
>(
  options: FormOpts<
    SchemaInput,
    SchemaOutput,
    SubmitResponseData,
    DefaultValues,
    FormInputData
  >,
): FormApi<FormInputData> {
  // everything from below
  const {
    handleSubmit: onSubmit,
    onSubmitSuccess,
    onSubmitFailure,
    onBeforeSubmit,
    onInvalidSubmit,
    submitSource,
    action,
    disableFocusOnError,
    serverValidationErrors,
    resetAfterSubmit,
    otherFormProps,
    reloadDocument,
    validationBehaviorConfig,
    id,
  } = options as any;

  const validator =
    "schema" in options && !!options.schema
      ? withStandardSchema(options.schema)
      : "validator" in options
        ? options.validator
        : (undefined as never);

  const defaultFormId = useId();
  const [form] = useState<FormScope<unknown>>(() => {
    const rvf = createFormScope({
      defaultValues: options.defaultValues ?? {},
      serverValidationErrors: serverValidationErrors ?? {},
      validator,
      onBeforeSubmit: onBeforeSubmit as never,
      onSubmit: onSubmit as never,
      onSubmitSuccess: (data) => {
        onSubmitSuccess?.(data);
        if (resetAfterSubmit) {
          const formElement = form.__store__.formRef.current;
          if (formElement) formElement.reset();
          else form.__store__.store.getState().reset();
        }
      },
      onInvalidSubmit: onInvalidSubmit ?? noOp,
      onSubmitFailure: onSubmitFailure ?? noOp,
      validationBehaviorConfig: validationBehaviorConfig,
      submitSource: submitSource ?? "dom",
      formProps: {
        action,
        id,
        ...otherFormProps,
      },
      flags: {
        disableFocusOnError: disableFocusOnError ?? false,
        reloadDocument: reloadDocument ?? false,
      },
      defaultFormId,
    });
    return rvf;
  });

  useEffect(() => {
    return registerFormElementEvents(form.__store__);
  }, [form.__store__]);

  const { initial, whenSubmitted, whenTouched } =
    validationBehaviorConfig ?? {};

  useEffect(() => {
    Object.assign(form.__store__.mutableImplStore, {
      validator: validator as any,
      onBeforeSubmit,
      onSubmit,
      onSubmitSuccess: (data: unknown) => {
        const successResult = onSubmitSuccess?.(data);
        return maybeThen(successResult, () => {
          if (resetAfterSubmit) {
            const formElement = form.__store__.formRef.current;
            if (formElement) formElement.reset();
            else form.__store__.store.getState().reset();
          }
        });
      },
      onInvalidSubmit,
      onSubmitFailure,
    });
  }, [
    validator,
    onSubmit,
    form.__store__.mutableImplStore,
    onSubmitSuccess,
    onSubmitFailure,
    form.__store__.store,
    resetAfterSubmit,
    form.__store__.formRef,
    onInvalidSubmit,
    onBeforeSubmit,
  ]);

  useEffect(() => {
    form.__store__.store.getState().syncOptions({
      submitSource: submitSource ?? "dom",
      validationBehaviorConfig:
        initial && whenSubmitted && whenTouched
          ? {
              initial,
              whenSubmitted,
              whenTouched,
            }
          : undefined,
      formProps: {
        action,
        id,
        ...otherFormProps,
      },
      flags: {
        disableFocusOnError: disableFocusOnError ?? false,
        reloadDocument: reloadDocument ?? false,
      },
    });
  }, [
    form.__store__.store,
    initial,
    submitSource,
    whenSubmitted,
    whenTouched,
    action,
    id,
    disableFocusOnError,
    otherFormProps,
    reloadDocument,
  ]);

  useEffect(() => {
    if (!serverValidationErrors) return;
    form.__store__.store
      .getState()
      .syncServerValidationErrors(serverValidationErrors ?? {});
  }, [serverValidationErrors, form.__store__.store]);

  return useFormInternal(form) as never;
}
