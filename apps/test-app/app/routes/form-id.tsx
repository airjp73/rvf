import { ActionFunctionArgs, json } from "react-router";
import { useActionData } from "react-router";
import { withZod } from "@rvf/zod";
import { ValidatedForm } from "@rvf/remix";
import { z } from "zod";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(z.object({}));

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await validator.validate(await request.formData());
  return json({ message: `Form has id: ${result.formId}` });
};

export default function FormId() {
  const actionData = useActionData<typeof action>();
  return (
    <ValidatedForm id="form-id-test-form" validator={validator} method="post">
      <p>{actionData?.message}</p>
      <SubmitButton />
    </ValidatedForm>
  );
}
