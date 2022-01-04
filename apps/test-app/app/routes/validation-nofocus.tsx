import { withYup } from "@remix-validated-form/with-yup";
import { useActionData } from "remix";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({
  firstName: yup.string().label("First Name").required(),
  lastName: yup.string().label("Last Name").required(),
  email: yup.string().label("Email").email().required(),
  contacts: yup
    .array(
      yup.object({
        name: yup.string().label("Name of a contact").required(),
      })
    )
    .required(),
});

const validator = withYup(schema);

export default function FrontendValidation() {
  const actionData = useActionData();
  return (
    <ValidatedForm validator={validator} method="post" disableFocusOnError>
      {actionData && <h1>{actionData.message}</h1>}
      <Input name="firstName" label="First Name" validateOnBlur />
      <Input name="lastName" label="Last Name" validateOnBlur />
      <Input name="email" label="Email" validateOnBlur />
      <Input name="contacts[0].name" label="Name of a contact" validateOnBlur />
      <SubmitButton />
    </ValidatedForm>
  );
}
