import { FormScope } from "@rvf/core";
import { useField } from "@rvf/react";
import { useId } from "react";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";

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
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        {...field.getInputProps({ type })}
        aria-describedby={errorId}
      />
      {field.error() && (
        <span className="text-red-500 text-sm" id={errorId}>
          {field.error()}
        </span>
      )}
    </div>
  );
};
