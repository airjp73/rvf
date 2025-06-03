import { FieldValues, AllProps, NonContradictingSupertype } from "@rvf/core";
import { FormOpts, useForm } from "./useForm";
import { FormApi } from "./base";
import { FormProvider } from "./context";

export type ValidatedFormProps<
  SchemaInput extends FieldValues,
  SchemaOutput,
  SubmitResponseData = unknown,
  DefaultValues extends FieldValues = SchemaInput,
  FormInputData extends FieldValues = NonContradictingSupertype<
    SchemaInput,
    DefaultValues
  >,
> = FormOpts<
  SchemaInput,
  SchemaOutput,
  SubmitResponseData,
  DefaultValues,
  FormInputData
> &
  Omit<React.ComponentProps<"form">, "children"> & {
    /**
     * A ref to the form element.
     */
    formRef?: React.RefObject<HTMLFormElement>;

    children:
      | React.ReactNode
      | ((form: FormApi<FormInputData>) => React.ReactNode);
  };

type SmudgeUnion = {
  validator?: any;
  schema?: any;
  defaultValues?: any;
};

export const ValidatedForm = <
  SchemaInput extends FieldValues,
  SchemaOutput,
  SubmitResponseData = unknown,
  const DefaultValues extends FieldValues = SchemaInput,
  FormInputData extends FieldValues = NonContradictingSupertype<
    SchemaInput,
    DefaultValues
  >,
>(
  props: ValidatedFormProps<
    SchemaInput,
    SchemaOutput,
    SubmitResponseData,
    DefaultValues,
    FormInputData
  >,
) => {
  const {
    formRef,
    defaultValues,
    serverValidationErrors,
    serverFormError,
    action,
    id,
    disableFocusOnError,
    handleSubmit,
    submitSource,
    validationBehaviorConfig,
    children,
    onBeforeSubmit,
    onSubmit,
    onReset,
    onSubmitSuccess,
    onSubmitFailure,
    onInvalidSubmit,
    resetAfterSubmit,
    otherFormProps,
    reloadDocument,
    validator,
    schema,
    ...rest
  } = props as ValidatedFormProps<any, any, any, any, any> & SmudgeUnion;

  const opts = {
    defaultValues: defaultValues,
    serverValidationErrors,
    serverFormError,
    action,
    id,
    disableFocusOnError,
    validator,
    schema,
    onBeforeSubmit,
    handleSubmit: handleSubmit as never,
    submitSource,
    onSubmitSuccess,
    onSubmitFailure,
    onInvalidSubmit,
    validationBehaviorConfig,
    resetAfterSubmit,
    otherFormProps,
    reloadDocument,
  } satisfies AllProps<FormOpts<any, any, any, any, any> & SmudgeUnion>;

  const rvf = useForm(opts as never);

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
        {typeof children === "function" ? children(rvf) : children}
      </form>
    </FormProvider>
  );
};
