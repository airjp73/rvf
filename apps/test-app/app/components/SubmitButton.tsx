import { useIsSubmitting, useIsValid } from "remix-validated-form";

type Props = {
  label?: string;
  submittingLabel?: string;
  disableWhenInvalid?: boolean;
  form?: string;
  name?: string;
  value?: string;
};

export const SubmitButton = ({
  label = "Submit",
  submittingLabel = "Submitting...",
  disableWhenInvalid,
  form,
  name,
  value,
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
    >
      {isSubmitting ? submittingLabel : label}
    </button>
  );
};
