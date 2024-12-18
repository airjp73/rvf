import { useActionData } from "react-router";
import { withZod } from "@rvf/zod";
import { ValidatedForm } from "@rvf/react-router";
import { z } from "zod";
import { SubmitButton } from "~/components/SubmitButton";
import { Route } from "./+types/form-id";

const validator = withZod(z.object({}));

export const action = async ({ request }: Route.ActionArgs) => {
  const result = await validator.validate(await request.formData());
  return { message: `Form has id: ${result.formId}` };
};

export default function FormId({ actionData }: Route.ComponentProps) {
  return (
    <ValidatedForm id="form-id-test-form" validator={validator} method="post">
      <p>{actionData?.message}</p>
      <SubmitButton />
    </ValidatedForm>
  );
}
