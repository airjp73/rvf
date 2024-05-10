import React, { FC } from "react";
import { useIsSubmitting } from "@rvf/remix";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

export const SubmitButton: FC<
  Omit<React.ComponentProps<typeof Button>, "label">
> = ({ disabled, ...rest }) => {
  const isSubmitting = useIsSubmitting();

  return (
    <div className="flex justify-end">
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
    </div>
  );
};
