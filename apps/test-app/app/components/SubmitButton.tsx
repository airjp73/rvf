import { useIsSubmitting } from "remix-validated-form";

type Props = {
  label?: string;
  submittingLabel?: string;
};

export const SubmitButton = ({
  label = "Submit",
  submittingLabel = "Submitting...",
}: Props) => {
  const isSubmitting = useIsSubmitting();
  return (
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? submittingLabel : label}
    </button>
  );
};
