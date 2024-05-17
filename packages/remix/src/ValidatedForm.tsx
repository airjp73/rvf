import { FieldValues } from "@rvf/core";
import { RvfRemixOpts, useRvf } from "./useRvf";
import { RvfProvider, RvfReact } from "@rvf/react";
import { FORM_ID_FIELD_NAME } from "./constants";
import {
  useDefaultValuesFromLoader,
  useErrorResponseForForm,
} from "./auto-server-hooks";
import { useId } from "react";

export type ValidatedFormProps<
  FormInputData extends FieldValues,
  FormOutputData,
> = RvfRemixOpts<FormInputData, FormOutputData> &
  Omit<React.ComponentProps<"form">, "children"> & {
    /**
     * A ref to the form element.
     */
    formRef?: React.RefObject<HTMLFormElement>;

    /**
     * Adds a hidden input to the form with the name `subaction` and the value of the subaction.
     * This can be used to handle multiple forms in the same action function.
     */
    subaction?: string;

    children:
      | React.ReactNode
      | ((form: RvfReact<FormInputData>) => React.ReactNode);
  };

export const ValidatedForm = <
  FormInputData extends FieldValues,
  FormOutputData,
>({
  validator,
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
  subaction,
  ...rest
}: ValidatedFormProps<FormInputData, FormOutputData>) => {
  const defaultFormId = useId();
  const formId = id ?? defaultFormId;

  const actualDefaultValues = useDefaultValuesFromLoader({ formId });
  const errorsFromServer = useErrorResponseForForm({
    fetcher,
    subaction,
    formId,
  });

  const rvf = useRvf<FormInputData, FormOutputData>({
    defaultValues: actualDefaultValues ?? defaultValues,
    serverValidationErrors: errorsFromServer?.fieldErrors,
    validator,
    handleSubmit: handleSubmit as never,
    submitSource,
    validationBehaviorConfig,
    action,
    method,
    replace,
    preventScrollReset,
    relative,
    encType,
    state,
    fetcher,
    formId,
  });

  return (
    <RvfProvider scope={rvf.scope()}>
      <form
        {...rvf.getFormProps({
          onSubmit,
          onReset,
          ref: formRef,
        })}
        {...rest}
        ref={formRef}
      >
        <input type="hidden" name={FORM_ID_FIELD_NAME} value={formId} />

        {!!subaction && (
          <input type="hidden" name="subaction" value={subaction} />
        )}

        {typeof children === "function" ? children(rvf) : children}
      </form>
    </RvfProvider>
  );
};
