import { useField, FormScope, ValueOfInputType } from "@rvf/react";
import { ComponentPropsWithRef, forwardRef, useId } from "react";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";
import { ErrorMessage } from "./ErrorMessage";
import { cn } from "~/lib/utils";

type BaseInputProps = Omit<ComponentPropsWithRef<"input">, "type">;

interface MyInputProps<Type extends string> extends BaseInputProps {
  label: string;
  scope: FormScope<ValueOfInputType<Type>>;
  type?: Type;
}

type InputType = <Type extends string>(
  props: MyInputProps<Type>,
) => React.ReactNode;

const MyInputImpl = forwardRef<HTMLInputElement, MyInputProps<string>>(
  ({ label, scope, type, ...rest }) => {
    const field = useField(scope);
    const inputId = useId();
    const errorId = useId();

    return (
      <div data-input className="relative">
        <Label
          className={cn(
            ["checkbox", "radio"].includes(type ?? "") &&
              "flex flex-row-reverse w-max items-center",
          )}
        >
          {label}
          <Input
            {...field.getInputProps({
              type,
              id: inputId,
              "aria-describedby": errorId,
              "aria-invalid": !!field.error(),
              ...rest,
            })}
          />
        </Label>
        {field.error() && (
          <ErrorMessage id={errorId} className="absolute">
            {field.error()}
          </ErrorMessage>
        )}
      </div>
    );
  },
);
MyInputImpl.displayName = "MyInput";

export const MyInput = MyInputImpl as InputType;
