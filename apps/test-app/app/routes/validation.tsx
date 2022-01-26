import { withZod } from "@remix-validated-form/with-zod";
import { ActionFunction, useActionData } from "remix";
import { validationError, ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  zfd.formData({
    firstName: zfd.text(
      z.string({
        required_error: "First Name is a required field",
      })
    ),
    lastName: zfd.text(
      z.string({
        required_error: "Last Name is a required field",
      })
    ),
    email: zfd.text(
      z
        .string({
          required_error: "Email is a required field",
        })
        .email({
          message: "Email must be a valid email",
        })
    ),
    contacts: z.array(
      z.object({
        name: zfd.text(
          z.string({
            required_error: "Name of a contact is a required field",
          })
        ),
      })
    ),
    likesPizza: zfd.checkbox(),
  })
);

export const action: ActionFunction = async ({ request }) => {
  const result = validator.validate(await request.formData());
  if (result.error) return validationError(result.error, result.submittedData);
  const { firstName, lastName } = result.data;

  return { message: `Submitted for ${firstName} ${lastName}!` };
};

export default function FrontendValidation() {
  const actionData = useActionData();
  return (
    <ValidatedForm validator={validator} method="post">
      {actionData && <h1>{actionData.message}</h1>}
      <Input name="firstName" label="First Name" />
      <Input name="lastName" label="Last Name" />
      <Input name="email" label="Email" />
      <Input name="contacts[0].name" label="Name of a contact" />
      <Input name="likesPizza" type="checkbox" label="Likes pizza" />
      <SubmitButton />
      <button type="reset">Reset</button>
    </ValidatedForm>
  );
}
