import { useActionData } from "react-router";
import { withYup } from "@rvf/yup";
import { ValidatedForm } from "@rvf/remix";
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
      }),
    )
    .required(),
});

const validator = withYup(schema);

export default function FrontendValidation() {
  const actionData = useActionData() as any;
  return (
    <ValidatedForm validator={validator} method="post" disableFocusOnError>
      {actionData && <h1>{actionData.message}</h1>}
      <Input name="firstName" label="First Name" />
      <Input name="lastName" label="Last Name" />
      <Input name="email" label="Email" />
      <Input name="contacts[0].name" label="Name of a contact" />
      <SubmitButton />
    </ValidatedForm>
  );
}
