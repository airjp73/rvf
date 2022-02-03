import { withZod } from "@remix-validated-form/with-zod";
import { ActionFunction, useActionData } from "remix";
import { validationError, ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const pretendApi = (val1: any, val2: any): Promise<boolean> =>
  new Promise((resolve) => setTimeout(() => resolve(val1 !== val2), 500));

const validator = withZod(
  zfd
    .formData({
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
    })
    .refine(async (data) => await pretendApi(data.firstName, data.lastName), {
      message: "First Name and Last Name must be different",
      path: ["lastName"],
    })
);

export const action: ActionFunction = async ({ request }) => {
  const result = await validator.validate(await request.formData());
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
      <SubmitButton />
      <button type="reset">Reset</button>
    </ValidatedForm>
  );
}
