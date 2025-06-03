import { createFormScope as createFormScope_impl, FormScope } from "@rvf/core";
import {
  FieldValues,
  NonContradictingSupertype,
  withStandardSchema,
} from "@rvf/core";
import { FormOpts } from "./useForm";

const noOp = () => {};

const genKey = () => `${Math.round(Math.random() * 10_000)}-${Date.now()}`;

export const createFormScope = <
  SchemaInput extends FieldValues = any,
  SchemaOutput = unknown,
  SubmitResponseData = unknown,
  const DefaultValues extends FieldValues = SchemaInput,
  FormInputData extends FieldValues = NonContradictingSupertype<
    SchemaInput,
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
): FormScope<FormInputData> => {
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
    serverFormError,
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

  const defaultFormId = genKey();

  const rvf = createFormScope_impl({
    defaultValues: options.defaultValues ?? {},
    serverValidationErrors: serverValidationErrors ?? {},
    serverFormError: serverFormError ?? null,
    validator,
    onBeforeSubmit: onBeforeSubmit as never,
    onSubmit: onSubmit as never,
    onSubmitSuccess: (data) => {
      onSubmitSuccess?.(data);

      // TODO: this could probably go in the core?
      if (resetAfterSubmit) {
        const formElement = rvf.__store__.formRef.current;
        if (formElement) formElement.reset();
        else rvf.__store__.store.getState().reset();
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

  return rvf as any;
};
