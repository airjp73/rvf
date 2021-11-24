import { ValidatedForm, withYup } from "../../remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";
import { useActionData } from "remix";

export const action = () => {
  return { message: "Submitted!" };
};

const schema = yup.object({
  firstName: yup.string().label("First Name").required(),
  lastName: yup.string().label("Last Name").required(),
  email: yup.string().label("Email").email().required(),
});

export default function FrontendValidation() {
  const actionData = useActionData();
  return (
    <ValidatedForm validator={withYup(schema)} method="post">
      {actionData && <h1>{actionData.message}</h1>}
      <Input name="firstName" label="First Name" validateOnBlur />
      <Input name="lastName" label="Last Name" validateOnBlur />
      <Input name="email" label="Email" validateOnBlur />
      <SubmitButton />
    </ValidatedForm>
  );
}
