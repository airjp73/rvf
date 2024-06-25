import { FormScope, ValueOfInputType } from "@rvf/core";
import { useField } from "@rvf/react";
import { useId } from "react";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";
import { ErrorMessage } from "./ErrorMessage";

// Try using the new `ValueOfInputType` type
type MyInputProps<Type extends string> = {
  label: string;
  scope: FormScope<ValueOfInputType<Type>>;
  type?: Type;
};

export const MyInput = <Type extends string>({
  label,
  scope,
  type,
}: MyInputProps<Type>) => {
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
