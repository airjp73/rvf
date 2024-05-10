import { withZod } from "@rvf/zod";
import { useField, ValidatedForm } from "remix-validated-form";
import { z } from "zod";

const validator = withZod(
  z.object({
    name: z.string(),
  }),
);

type InputProps = { name: string; label: string; formId?: string };

const Input = ({ name, label, formId }: InputProps) => {
  const { error, getInputProps } = useField(name, { formId });
  return (
    <label>
      {label}
      <input {...getInputProps()} />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </label>
  );
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Bug reproduction template</h1>
      <p>Fork and edit this CodeSandbox and share it in the issue</p>
      <ValidatedForm validator={validator}>
        <Input name="name" label="Name" />
      </ValidatedForm>
    </div>
  );
}
