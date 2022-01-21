import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
} from "@chakra-ui/react";
import { useField } from "remix-validated-form";

type FormInputProps = Omit<InputProps, "defaultValue" | "name"> & {
  name: string;
  label: string;
  isRequired?: boolean;
};

export const FormInput = ({
  name,
  label,
  isRequired,
  ...rest
}: FormInputProps) => {
  const { getInputProps, error } = useField(name);

  return (
    <>
      <FormControl isInvalid={!!error} isRequired={isRequired}>
        <FormLabel htmlFor={name}>{label}</FormLabel>
        <Input
          {...getInputProps({
            id: name,
            ...rest,
          })}
        />
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    </>
  );
};
