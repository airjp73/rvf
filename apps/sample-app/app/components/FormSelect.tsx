import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
  SelectProps,
} from "@chakra-ui/react";
import { useField } from "remix-validated-form";

type FormSelectProps = {
  name: string;
  label: string;
  isRequired?: boolean;
};

export const FormSelect = ({
  name,
  label,
  isRequired,
  ...rest
}: FormSelectProps & SelectProps) => {
  const { getInputProps, error } = useField(name);
  return (
    <FormControl isInvalid={!!error} isRequired={isRequired}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Select
        {...getInputProps({
          id: name,
          ...rest,
        })}
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};
