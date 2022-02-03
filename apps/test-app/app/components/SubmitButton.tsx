import { useIsSubmitting, useIsValid } from "remix-validated-form";

type Props = {
  label?: string;
  submittingLabel?: string;
  disableWhenInvalid?: boolean;
};

export const SubmitButton = ({
  label = "Submit",
  submittingLabel = "Submitting...",
  disableWhenInvalid,
}: Props) => {
  const isSubmitting = useIsSubmitting();
  const isValid = useIsValid();
  return (
    <button
      type="submit"
      disabled={disableWhenInvalid ? isSubmitting || !isValid : isSubmitting}
    >
      {isSubmitting ? submittingLabel : label}
    </button>
  );
};
