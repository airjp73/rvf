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
  return (
    <button
      type="submit"
      disabled={disableWhenInvalid ? isSubmitting || !isValid : isSubmitting}
      name={name}
      value={value}
      form={form}
      data-testid={dataTestid}
      formMethod={formMethod}
    >
      {isSubmitting ? submittingLabel : label}
    </button>
  );
};
