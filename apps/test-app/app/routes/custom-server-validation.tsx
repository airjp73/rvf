import { withYup } from "@remix-validated-form/with-yup";
import { ActionFunction } from "remix";
import { validationError, ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});

const validator = withYup(schema);

export const action: ActionFunction = async () => {
  return validationError(
    {
      fieldErrors: { firstName: "Error", lastName: "Error 2" },
      formId: "test-form",
    },
    { firstName: "Bob", lastName: "Ross" }
  );
};

export default function CustomServerValidation() {
  return (
    <>
      <Input name="firstName" label="First Name" form="test-form" />
      <ValidatedForm validator={validator} method="post" id="test-form">
        <Input name="lastName" label="Last Name" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
