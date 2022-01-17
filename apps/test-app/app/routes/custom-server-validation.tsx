import { withYup } from "@remix-validated-form/with-yup";
import { ActionFunction } from "remix";
import { validationError, ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});

const validator = withYup(schema);

export const action: ActionFunction = async ({ request }) => {
  return validationError({ firstName: "Error" }, { firstName: "Bob" });
};

export default function CustomServerValidation() {
  return (
    <ValidatedForm validator={validator} method="post">
      <Input name="firstName" label="First Name" />
      <SubmitButton />
    </ValidatedForm>
  );
}
