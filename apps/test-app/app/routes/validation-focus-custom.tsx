import { useActionData } from "react-router";
import { withYup } from "@rvf/yup";
import { useRef } from "react";
import { useControlField, useField, ValidatedForm } from "@rvf/remix";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({
  something: yup.string().required(),
  custom: yup.string().required(),
});

const validator = withYup(schema);

const ControlledInput = ({ name, label }: { name: string; label: string }) => {
  // This is super contrived, but you might end up in this situation with a select component.
  // There might be a hidden input for the real value, and a search input for the search value.
  const field = useField(name);
  const [value, setValue] = useControlField<string>(name);

  return (
    <>
      <input {...field.getHiddenInputProps()} />
      <input data-testid={name} {...(field.getControlProps() as any)} />
    </>
  );
};

export default function FrontendValidation() {
  const actionData = useActionData() as any;
  return (
    <ValidatedForm validator={validator} method="post">
      {actionData && <h1>{actionData.message}</h1>}
      <Input name="something" label="Something" />
      <ControlledInput name="custom" label="Last" />
      <SubmitButton />
    </ValidatedForm>
  );
}
