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

type ValidatorAndDefaultValues<
  FormInputData extends FieldValues,
  FormOutputData,
> =
  | {
      /**
       * A validator object created by a validation adapter such a `withZod` or `withYup`.
       * See [these docs](https://rvf-js.io/validation-library-support) for more details
       * and information on how to create a validator for other validation libraries.
       */
      validator: Validator<FormOutputData>;
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
  | {
      /**
       * A [Standard Schema](https://github.com/standard-schema/standard-schema) compliant schema.
       */
      schema: StandardSchemaV1<FormInputData, FormOutputData>;
      /**
       * Sets the default values of the form.
       *
       * For Typescript users, `defaultValues` sets the default values of the form.
       * By default, this is limitted to the input type of the validator,
       * but you can widen the type here by using `as Type`.
       *
       * It's recommended that you provide a default value for every field in the form.
       *
       * @example
       * ```ts
       * useForm({
       *   validator: z.object({
       *     foo: z.string(),
       *     bar: z.string(),
       *   }),
       *   defaultValues: {
       *     foo: 123 as string | number,
       *     bar: "hi",
       *   },,
       * })
       * ```
       */
      defaultValues: FormInputData;
    };

export type FormOpts<
  FormInputData extends FieldValues = FieldValues,
  FormOutputData = never,
  SubmitResponseData = unknown,
> = ValidatorAndDefaultValues<FormInputData, FormOutputData> & {
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
} & FormSubmitOpts<FormOutputData, SubmitResponseData>;

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
 * Create and use an `FormScope`.
 */
export function useForm<
  FormInputData extends FieldValues,
  FormOutputData,
  SubmitResponseData,
>(
  options: FormOpts<FormInputData, FormOutputData, SubmitResponseData>,
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
  } = options;

  const validator =
    "schema" in options
      ? withStandardSchema(options.schema)
      : options.validator;

  const defaultFormId = useId();
  const [form] = useState<FormScope<unknown>>(() => {
    const rvf = createFormScope({
      defaultValues: options.defaultValues ?? {},
      serverValidationErrors: serverValidationErrors ?? {},
      validator,
      onBeforeSubmit: onBeforeSubmit as never,
      onSubmit: onSubmit as never,
      onSubmitSuccess: (data) => {
        onSubmitSuccess?.(data as SubmitResponseData);
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
        const successResult = onSubmitSuccess?.(data as SubmitResponseData);
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
