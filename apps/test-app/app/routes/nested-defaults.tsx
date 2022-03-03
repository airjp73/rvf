import { withZod } from "@remix-validated-form/with-zod";
import { useField } from "remix-validated-form";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";

interface SwitchProps {
  name: string;
  label: string;
  "data-testid"?: string;
}

const Switch = ({ name, label, "data-testid": dataTestId }: SwitchProps) => {
  const { getInputProps } = useField(name);

  return (
    <div>
      <input
        type="checkbox"
        {...getInputProps({
          type: "checkbox",
          id: name,
        })}
      />
      <label>{label}</label>
      <pre data-testid={dataTestId}>
        {JSON.stringify(getInputProps({ type: "checkbox" }), null, 2)}
      </pre>
    </div>
  );
};

export const validator = withZod(
  z.object({
    check: zfd.checkbox(),
    nested: z.object({
      checkTrue: zfd.checkbox(),
      checkFalse: zfd.checkbox(),
    }),
  })
);

export default function Index() {
  return (
    <div>
      <ValidatedForm
        validator={validator}
        method="post"
        replace={true}
        defaultValues={{
          check: true,
          nested: { checkTrue: true, checkFalse: false },
        }}
      >
        <Switch name="check" label="Checkbox" data-testid="check" />
        <Switch
          name="nested.checkTrue"
          label="Nested checkbox (true)"
          data-testid="nestedCheckTrue"
        />
        <Switch
          name="nested.checkFalse"
          label="Nested checkbox (false)"
          data-testid="nestedCheckFalse"
        />
      </ValidatedForm>
    </div>
  );
}
