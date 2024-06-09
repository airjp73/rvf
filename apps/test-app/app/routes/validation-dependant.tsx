import { DataFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withYup } from "@rvf/yup";
import { validationError, ValidatedForm } from "@rvf/remix";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withYup(
  yup.object({
    isRequired: yup.string().optional(),
    firstName: yup
      .string()
      .label("First name")
      .when("isRequired", { is: (v: any) => !!v, then: (s) => s.required() }),
  }),
);

export const action = async ({ request }: DataFunctionArgs) => {
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error, result.submittedData);
  const { firstName } = result.data;

  return json({ message: `Submitted for ${firstName}!` });
};

export default function FrontendValidation() {
  const actionData = useActionData<typeof action>();
  return (
    <>
      <ValidatedForm validator={validator} method="post">
        {actionData && "message" in actionData && <h1>{actionData.message}</h1>}
        <Input name="firstName" label="First name" />
        <Input name="isRequired" label="Is required" type="checkbox" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
