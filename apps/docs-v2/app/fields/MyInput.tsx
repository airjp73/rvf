import { FormScope } from "@rvf/core";
import { useField } from "@rvf/react";
import { useId } from "react";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";
import { ErrorMessage } from "./ErrorMessage";

type MyInputProps =
  | {
      label: string;
      scope: FormScope<string>;
      type?: "text";
    }
  | {
      label: string;
      scope: FormScope<number>;
      type: "number";
    };

export const MyInput = ({ label, scope, type }: MyInputProps) => {
  const field = useField(scope);
  const inputId = useId();
  const errorId = useId();

  return (
    <div data-input className="relative">
      <Label>
        {label}
        <Input
          id={inputId}
          {...field.getInputProps({ type })}
          aria-describedby={errorId}
          aria-invalid={!!field.error()}
        />
      </Label>
      {field.error() && (
        <ErrorMessage id={errorId} className="absolute">
          {field.error()}
        </ErrorMessage>
      )}
    </div>
  );
};
