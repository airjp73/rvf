import { withYup } from "@remix-validated-form/with-yup";
import { useRef } from "react";
import { useActionData } from "remix";
import { useField, ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({
  contactSelect: yup.string().required(),
  something: yup.string().required(),
});

const validator = withYup(schema);

const CustomInput = ({ name, label }: { name: string; label: string }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  // This is super contrived, but you might end up in this situation with a select component.
  // There might be a hidden input for the real value, and a search input for the search value.
  useField(name, {
    handleReceiveFocus: () => searchInputRef.current?.focus(),
  });

  return (
    <>
      <input name={name} type="hidden" />
      <input
        data-testid={`search-${name}`}
        id={`search-${name}`}
        name={`search-${name}`}
        ref={searchInputRef}
      />
    </>
  );
};

export default function FrontendValidation() {
  const actionData = useActionData();
  return (
    <ValidatedForm validator={validator} method="post">
      {actionData && <h1>{actionData.message}</h1>}
      <CustomInput name="contactSelect" label="Choose a contact" />
      <Input name="something" label="Something" validateOnBlur />
      <SubmitButton />
    </ValidatedForm>
  );
}
