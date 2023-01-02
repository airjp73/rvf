import { DataFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
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
  })
);

export const action = async ({ request }: DataFunctionArgs) => {
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  const { firstName } = result.data;

  return json({ message: `Submitted for ${firstName}!` });
};

export default function FrontendValidation() {
  const actionData = useActionData<typeof action>();
  return (
    <ValidatedForm validator={validator} method="post">
      {actionData && "message" in actionData && <h1>{actionData.message}</h1>}
      <Input name="firstName" label="First Name" />
      <SubmitButton disableWhenInvalid />
    </ValidatedForm>
  );
}
