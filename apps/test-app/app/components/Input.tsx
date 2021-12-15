import { useField } from "remix-validated-form";

type InputProps = {
  name: string;
  label: string;
  validateOnBlur?: boolean;
};

export const Input = ({ name, label, validateOnBlur }: InputProps) => {
  const { validate, clearError, defaultValue, error } = useField(name);
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        onBlur={validateOnBlur ? validate : undefined}
        onChange={clearError}
        defaultValue={defaultValue}
      />
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  );
};
