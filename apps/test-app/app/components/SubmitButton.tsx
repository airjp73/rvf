import {
  FormScope,
  useIsSubmitting,
  useIsValid,
  useFormScopeOrContext,
} from "@rvf/react-router";

type Props = {
  label?: string;
  submittingLabel?: string;
  disableWhenInvalid?: boolean;
  form?: FormScope<any>;
  name?: string;
  value?: string;
  "data-testid"?: string;
  formMethod?: string;
};

export const SubmitButton = ({
  label = "Submit",
  submittingLabel = "Submitting...",
  disableWhenInvalid,
  form,
  name,
  value,
  "data-testid": dataTestid,
  formMethod,
}: Props) => {
  const isSubmitting = useIsSubmitting(form);
  const isValid = useIsValid(form);
  const rvf = useFormScopeOrContext(form);
  return (
    <button
      type="submit"
      disabled={disableWhenInvalid ? isSubmitting || !isValid : isSubmitting}
      name={name}
      value={value}
      data-testid={dataTestid}
      formMethod={formMethod}
      form={rvf.formOptions.formId}
    >
      {isSubmitting ? submittingLabel : label}
    </button>
  );
};
