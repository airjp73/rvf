import { AllProps, FieldValues, NonContradictingSupertype } from "@rvf/core";
import { RemixFormOpts, useForm } from "./useForm";
import { FormProvider, FormApi } from "@rvf/react";

type SmudgeUnion = {
  validator?: any;
  schema?: any;
  defaultValues?: any;
};

export type ValidatedFormProps<
  SchemaInput extends FieldValues,
  SchemaOutput,
  DefaultValues extends FieldValues = SchemaInput,
  FormInputData extends FieldValues = NonContradictingSupertype<
    SchemaInput,
    DefaultValues
  >,
> = RemixFormOpts<SchemaInput, SchemaOutput, DefaultValues, FormInputData> &
  Omit<React.ComponentProps<"form">, "children"> & {
    /**
     * A ref to the form element.
     */
    formRef?: React.RefObject<HTMLFormElement>;

    children:
      | React.ReactNode
      | ((form: FormApi<FormInputData>) => React.ReactNode);
  };

export const ValidatedForm = <
  SchemaInput extends FieldValues,
  SchemaOutput,
  const DefaultValues extends FieldValues = SchemaInput,
  FormInputData extends FieldValues = NonContradictingSupertype<
    SchemaInput,
    DefaultValues
  >,
>(
  props: ValidatedFormProps<
    SchemaInput,
    SchemaOutput,
    DefaultValues,
    FormInputData
  >,
) => {
  const {
    validator,
    schema,
    formRef,
    defaultValues,
    handleSubmit,
    submitSource,
    validationBehaviorConfig,
    children,
    onSubmit,
    onReset,
    action,
    method,
    replace,
    id,
    preventScrollReset,
    relative,
    encType,
    state,
    fetcher,
    onBeforeSubmit,
    onSubmitSuccess,
    onSubmitFailure,
    onInvalidSubmit,
    disableFocusOnError,
    resetAfterSubmit,
    fetcherKey,
    navigate,
    otherFormProps,
    reloadDocument,
    viewTransition,
    experimental_eventListener,
    ...rest
  } = props as ValidatedFormProps<any, any, any, any> & SmudgeUnion;

  const opts = {
    action,
    id,
    disableFocusOnError,
    validator,
    schema,
    handleSubmit: handleSubmit as never,
    submitSource,
    onBeforeSubmit,
    onSubmitSuccess,
    onSubmitFailure,
    onInvalidSubmit,
    validationBehaviorConfig,
    method,
    replace,
    preventScrollReset,
    relative,
    encType,
    state,
    resetAfterSubmit,
    fetcherKey,
    navigate,
    otherFormProps,
    reloadDocument,
    defaultValues,
    viewTransition,
    fetcher,
    experimental_eventListener,
  } satisfies AllProps<
    RemixFormOpts<SchemaInput, SchemaOutput, DefaultValues, FormInputData> &
      SmudgeUnion
  >;
  const rvf = useForm<SchemaInput, SchemaOutput, DefaultValues, FormInputData>(
    opts,
  );

  return (
    <FormProvider scope={rvf.scope()}>
      <form
        {...rvf.getFormProps({
          onSubmit,
          onReset,
          ref: formRef,
        })}
        {...rest}
      >
        {rvf.renderFormIdInput()}
        {typeof children === "function" ? children(rvf) : children}
      </form>
    </FormProvider>
  );
};
