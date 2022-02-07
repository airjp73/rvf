import { withZod } from "@remix-validated-form/with-zod";
import { ActionFunction, json, useActionData } from "remix";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(z.object({}));

export const action: ActionFunction = async ({ request }) => {
  const result = await validator.validate(await request.formData());
  return json({ message: `Form has id: ${result.formId}` });
};

export default function FormId() {
  const actionData = useActionData();
  return (
    <ValidatedForm validator={validator} method="post" id="form-id-test-form">
      <p>{actionData?.message}</p>
      <SubmitButton />
    </ValidatedForm>
  );
}
