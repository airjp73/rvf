import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
} from "@chakra-ui/react";
import { useField } from "remix-validated-form";

type FormInputProps = {
  name: string;
  label: string;
  isRequired?: boolean;
};

export const FormInput = ({
  name,
  label,
  isRequired,
  ...rest
}: FormInputProps & InputProps) => {
  const { validate, clearError, defaultValue, error } = useField(name);

  return (
    <>
      <FormControl isInvalid={!!error} isRequired={isRequired}>
        <FormLabel htmlFor={name}>{label}</FormLabel>
        <Input
          id={name}
          name={name}
          onBlur={validate}
          onChange={clearError}
          defaultValue={defaultValue}
          {...rest}
        />
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    </>
  );
};
