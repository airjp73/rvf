import { DataFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withZod } from "@rvf/zod";
import { validationError, ValidatedForm } from "@rvf/remix";
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
        }),
      ),
      lastName: zfd.text(
        z.string({
          required_error: "Last Name is a required field",
        }),
      ),
    })
    .refine(async (data) => await pretendApi(data.firstName, data.lastName), {
      message: "First Name and Last Name must be different",
      path: ["lastName"],
    }),
);

export const action = async ({ request }: DataFunctionArgs) => {
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  const { firstName, lastName } = result.data;

  return json({ message: `Submitted for ${firstName} ${lastName}!` });
};

export default function FrontendValidation() {
  const actionData = useActionData<typeof action>();
  return (
    <ValidatedForm validator={validator} method="post">
      {actionData && "message" in actionData && <h1>{actionData.message}</h1>}
      <Input name="firstName" label="First Name" />
      <Input name="lastName" label="Last Name" />
      <SubmitButton />
      <button type="reset">Reset</button>
    </ValidatedForm>
  );
}
