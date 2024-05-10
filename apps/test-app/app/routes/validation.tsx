import { DataFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withZod } from "@rvf/zod";
import { validationError, ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";
import { Textarea } from "~/components/Textarea";

const validator = withZod(
  zfd.formData({
    firstName: zfd.text(
      z.string({
        required_error: "First Name is a required field",
      }),
    ),
    lastName: zfd.text(
      z.string({
        required_error: "Last Name is a required field",
      }),
    ),
    email: zfd.text(
      z
        .string({
          required_error: "Email is a required field",
        })
        .email({
          message: "Email must be a valid email",
        }),
    ),
    contacts: z.array(
      z.object({
        name: zfd.text(
          z.string({
            required_error: "Name of a contact is a required field",
          }),
        ),
      }),
    ),
    likesPizza: zfd.checkbox(),
    comment: zfd.text(
      z.string({
        required_error: "Comment is a required field",
      }),
    ),
  }),
);

export const action = async ({ request }: DataFunctionArgs) => {
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error, result.submittedData);
  const { firstName, lastName } = result.data;

  return json({ message: `Submitted for ${firstName} ${lastName}!` });
};

export default function FrontendValidation() {
  const actionData = useActionData<typeof action>();
  return (
    <>
      <Input name="firstName" label="First Name" form="test-form" />
      <ValidatedForm validator={validator} method="post" id="test-form">
        {actionData && "message" in actionData && <h1>{actionData.message}</h1>}
        <Input name="lastName" label="Last Name" />
        <Input name="email" label="Email" />
        <Input name="contacts[0].name" label="Name of a contact" />
        <Input name="likesPizza" type="checkbox" label="Likes pizza" />
        <Textarea name="comment" label="Comment" />
        <SubmitButton />
        <button type="reset">Reset</button>
      </ValidatedForm>
    </>
  );
}
