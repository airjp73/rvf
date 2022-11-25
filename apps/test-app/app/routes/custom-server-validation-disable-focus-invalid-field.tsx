import { withYup } from "@remix-validated-form/with-yup";
import { ActionFunction } from "remix";
import { validationError, ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({
  firstName: yup.string(),
  lastName: yup.string(),
});

const validator = withYup(schema);

export const action: ActionFunction = async () => {
  return validationError(
    {
      fieldErrors: { firstName: "Error" },
      formId: "test-form",
    },
    { firstName: "Bob", lastName: "Ross" }
  );
};

export default function CustomServerValidationFocusInvalidField() {
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      id="test-form"
      disableFocusOnError={true}
    >
      <Input name="firstName" label="First Name" />
      <Input name="lastName" label="Last Name" />
      <SubmitButton />
    </ValidatedForm>
  );
}
