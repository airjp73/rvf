import { useEffect, useState, useId, ComponentProps } from "react";
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
} from "@rvf/core";
import { FormApi, useFormInternal } from "./base";
import { FieldErrors } from "@rvf/core";
import { StandardSchemaV1 } from "@standard-schema/spec";
import { InternalResolveOptions } from "vite";

///////////////////////////////// Type work
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type Primitive = string | number | boolean | symbol | bigint | null | undefined;
type SmallestSupertype<T, U> = T extends Primitive
  ? T | U
  : U extends Primitive
    ? T | U
    : Prettify<
        {
          [K in keyof T]: SmallestSupertype<
            T[K],
            K extends keyof U ? U[K] : undefined
          >;
        } & {
          [K in Exclude<keyof U, keyof T>]: SmallestSupertype<U[K], undefined>;
        }
      >;

type A = SmallestSupertype<string | boolean, boolean | number>;
type B = SmallestSupertype<
  { foo: string | number; bar: string },
  { foo: number; bar: number | boolean; baz?: symbol }
>;

type HandleObjects<T, U> = T extends never
  ? never
  : Prettify<
      {
        [K in Exclude<keyof T, keyof U>]: T[K];
      } & {
        [K in Exclude<keyof U, keyof T>]?: never;
      } & {
        [K in keyof T & keyof U]: Prettify<
          NonContradictingSupertype<T[K], U[K]>
        >;
      }
    >;

type Extends<One, Two> = One extends Two ? true : false;
type HandlePrimitives<T, U> = Extends<T, U> extends true ? U : T;
type NonContradictingSupertype<T, U> = [T, U] extends [Primitive, Primitive]
  ? HandlePrimitives<T, U>
  : T extends Primitive
    ? T
    : U extends Primitive
      ? T
      : HandleObjects<T, U>;

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
   * If you're using an adapter like `@rvf/react-router`, this will be called even if you aren't using `handleSubmit`.
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

// interface ST<FormOutputData, FormInputData extends FieldValues> {
//   /**
//    * A [Standard Schema](https://standardschema.dev/) compliant schema.
//    * The input type of this schema will be used to help make `defaultValues` typesafe,
//    * as well as determine the types when using the `FormApi` returned from this hook.
//    */
//   schema: StandardSchemaV1<unknown, FormOutputData>;

//   /**
//    * Sets the default values of the form.
//    *
//    * For Typescript users, `defaultValues` is one of the most important props you'll use.
//    * The type of the object you pass here, will determine the type of the data you get
//    * when interacting with the form. For example, `form.value('myField')` will be typed based on
//    * the type of `defaultValues.myField`.
//    *
//    * It's recommended that you provide a default value for every field in the form.
//    */
//   defaultValues: NonContradictingSupertype<
//     NoInfer<StandardSchemaV1.InferInput<this["schema"]>>,
//     FormInputData
//   >;
// }

export type internal_ValidatorAndDefaultValueOpts<
  SchemaInput extends FieldValues,
  SchemaOutput,
  DefaultValues extends FieldValues,
  FormInputData extends FieldValues,
> =
  | {
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
    }
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
        NoInfer<SchemaInput>,
        DefaultValues
      >;
    });

export type FormOpts<
  SchemaInput extends FieldValues = any,
  SchemaOutput = unknown,
  SubmitResponseData = unknown,
  DefaultValues extends FieldValues = SchemaInput,
  FormInputData extends FieldValues = NonContradictingSupertype<
    NoInfer<SchemaInput>,
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
  DefaultValues extends FieldValues = SchemaInput,
  FormInputData extends FieldValues = NonContradictingSupertype<
    NoInfer<SchemaInput>,
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
