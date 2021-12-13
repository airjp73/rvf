import { ActionFunction, useActionData } from "remix";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";
import {
  validationError,
  ValidatedForm,
  withYup,
} from "../../remix-validated-form";

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

export const action: ActionFunction = async ({ request }) => {
  const result = validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  const { firstName, lastName } = result.data;

  return { message: `Submitted for ${firstName} ${lastName}!` };
};

export default function FrontendValidation() {
  const actionData = useActionData();
  return (
    <ValidatedForm validator={validator} method="post">
      {actionData && <h1>{actionData.message}</h1>}
      <Input name="firstName" label="First Name" validateOnBlur />
      <Input name="lastName" label="Last Name" validateOnBlur />
      <Input name="email" label="Email" validateOnBlur />
      <Input name="contacts[0].name" label="Name of a contact" validateOnBlur />
      <SubmitButton />
    </ValidatedForm>
  );
}
