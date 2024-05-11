import { ExclamationCircleIcon } from "@heroicons/react/solid";
import classNames from "classnames";
import { FC } from "react";
import { useField } from "remix-validated-form";

export type InputProps = {
  label: string;
  name: string;
  optional?: boolean;
  className?: string;
};

export const FormInput: FC<
  InputProps & JSX.IntrinsicElements["input"]
> = ({
  label,
  name,
  optional,
  className,
  onChange,
  ...rest
}) => {
  const { error, getInputProps } = useField(name);

  return (
    <div className={className}>
      <div className="flex justify-between">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-300"
        >
          {label}
        </label>
        {optional && (
          <span className="text-sm text-gray-500">
            Optional
          </span>
        )}
      </div>
      <div className="mt-1 relative flex rounded-md shadow-sm">
        <input
          {...getInputProps({
            onChange,
            id: name,
            type: "text",
            className: classNames(
              "border focus:ring-teal-500 focus:border-teal-500 focus:z-10 block w-full sm:text-sm text-black pr-10",
              "rounded-md p-2",
              error &&
                "border-red-800 bg-red-50 text-red-800 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500",
            ),
            ...rest,
          })}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
