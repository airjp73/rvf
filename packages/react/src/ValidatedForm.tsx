import { FieldValues, AllProps } from "@rvf/core";
import { FormOpts, useForm } from "./useForm";
import { FormApi } from "./base";
import { FormProvider } from "./context";

export type ValidatedFormProps<
  FormInputData extends FieldValues,
  FormOutputData,
> = FormOpts<FormInputData, FormOutputData> &
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
  FormInputData extends FieldValues,
  FormOutputData,
>(
  props: ValidatedFormProps<FormInputData, FormOutputData>,
) => {
  const {
    formRef,
    defaultValues,
    serverValidationErrors,
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
  } = props as ValidatedFormProps<FormInputData, FormOutputData> & SmudgeUnion;

  const opts = {
    defaultValues: defaultValues,
    serverValidationErrors,
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
  } satisfies AllProps<
    FormOpts<FormInputData, FormOutputData, void> & SmudgeUnion
  >;

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
