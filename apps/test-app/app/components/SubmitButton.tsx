import { useIsSubmitting, useIsValid } from "remix-validated-form";

type Props = {
  label?: string;
  submittingLabel?: string;
  disableWhenInvalid?: boolean;
  form?: string;
  name?: string;
  value?: string;
  "data-testid"?: string;
  formMethod?: string;
  formNoValidate?: boolean;
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
  formNoValidate,
}: Props) => {
  const isSubmitting = useIsSubmitting(form);
  const isValid = useIsValid(form);
  return (
    <button
      type="submit"
      disabled={disableWhenInvalid ? isSubmitting || !isValid : isSubmitting}
      name={name}
      value={value}
      form={form}
      data-testid={dataTestid}
      formMethod={formMethod}
      formNoValidate={formNoValidate}
    >
      {isSubmitting ? submittingLabel : label}
    </button>
  );
};
