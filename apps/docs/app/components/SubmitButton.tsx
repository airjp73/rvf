import React, { FC } from "react";
import { useIsSubmitting } from "remix-validated-form";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

export const SubmitButton: FC<
  Omit<React.ComponentProps<typeof Button>, "label">
> = ({ disabled, ...rest }) => {
  const isSubmitting = useIsSubmitting();

  return (
    <Button
      type="submit"
      disabled={disabled || isSubmitting}
      label={isSubmitting ? "Submitting..." : "Submit"}
      icon={
        isSubmitting ? (
          <Spinner className="text-gray-700" />
        ) : undefined
      }
      {...rest}
    />
  );
};
