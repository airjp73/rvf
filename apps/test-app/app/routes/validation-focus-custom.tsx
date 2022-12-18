import { useActionData } from "@remix-run/react";
import { withYup } from "@remix-validated-form/with-yup";
import { useRef } from "react";
import { useControlField, useField, ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({
  something: yup.string().required(),
  custom: yup.string().required(),
});

const validator = withYup(schema);

const ControlledInput = ({ name, label }: { name: string; label: string }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  // This is super contrived, but you might end up in this situation with a select component.
  // There might be a hidden input for the real value, and a search input for the search value.
  useField(name, {
    handleReceiveFocus: () => searchInputRef.current?.focus(),
  });
  const [value, setValue] = useControlField<string>(name);

  return (
    <>
      <input type="hidden" name={name} />
      <input
        data-testid={name}
        ref={searchInputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </>
  );
};

export default function FrontendValidation() {
  const actionData = useActionData();
  return (
    <ValidatedForm validator={validator} method="post">
      {actionData && <h1>{actionData.message}</h1>}
      <Input name="something" label="Something" />
      <ControlledInput name="custom" label="Last" />
      <SubmitButton />
    </ValidatedForm>
  );
}
