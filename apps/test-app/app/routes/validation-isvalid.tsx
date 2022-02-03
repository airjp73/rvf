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
  })
);

export const action: ActionFunction = async ({ request }) => {
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  const { firstName } = result.data;

  return { message: `Submitted for ${firstName}!` };
};

export default function FrontendValidation() {
  const actionData = useActionData();
  return (
    <ValidatedForm validator={validator} method="post">
      {actionData && <h1>{actionData.message}</h1>}
      <Input name="firstName" label="First Name" />
      <SubmitButton disableWhenInvalid />
    </ValidatedForm>
  );
}
