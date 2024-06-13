import { ComponentProps } from "react";
import { cn } from "~/lib/utils";

export const ErrorMessage = ({
  className,
  ...props
}: ComponentProps<"span">) => {
  return (
    <span
      className={cn("text-red-600 dark:text-red-500 text-sm", className)}
      {...props}
    />
  );
};
