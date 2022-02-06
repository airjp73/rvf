import { withYup } from "@remix-validated-form/with-yup";
import { ActionFunction, json, useActionData } from "remix";
import { useFormContext, ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withYup(
  yup.object({
    firstName: yup.string().required(),
  })
);

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  await new Promise((resolve) => setTimeout(resolve, 500));
  return json({ message: `Submitted ${data.get("mySubmit")}` });
};

const DisplayContext = ({
  testid,
  form,
}: {
  testid: string;
  form?: string;
}) => {
  // Deprecated but convenient for this test
  const { action, hasBeenSubmitted, isValid } = useFormContext(form);

  return (
    <div data-testid={testid}>
      <dl>
        <dt>hasBeenSubmitted</dt>
        <dd>{hasBeenSubmitted ? "true" : "false"}</dd>

        <dt>isValid</dt>
        <dd>{isValid ? "true" : "false"}</dd>

        <dt>action</dt>
        <dd>{action}</dd>
      </dl>
    </div>
  );
};

export default function FrontendValidation() {
  const actionData = useActionData();
  return (
    <>
      {actionData?.message && <h1>{actionData.message}</h1>}
      <DisplayContext testid="external-values" form="test-form" />
      <ValidatedForm
        validator={validator}
        method="post"
        id="test-form"
        action="/context-hooks"
      >
        <Input name="firstName" label="First Name" />
        <DisplayContext testid="internal-values" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
