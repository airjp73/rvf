import { useIsSubmitting } from "../../../build";

export const SubmitButton = () => {
  const isSubmitting = useIsSubmitting();
  return (
    <button type="submit">{isSubmitting ? "Submitting..." : "Submit"}</button>
  );
};
