import { ActionFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withZod } from "@rvf/zod";
import { ValidatedForm, useServerValidationErrors } from "@rvf/remix";
import { z } from "zod";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(z.object({}));

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await validator.validate(await request.formData());
  return json({ message: `Form has id: ${result.formId}` });
};

export default function FormId() {
  const actionData = useActionData<typeof action>();
  const server = useServerValidationErrors({
    formId: "form-id-test-form",
    defaultValues: {},
  });
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      {...server.getFormOpts()}
    >
      {server.renderHiddenInput()}
      <p>{actionData?.message}</p>
      <SubmitButton />
    </ValidatedForm>
  );
}
