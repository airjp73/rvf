import { withYup } from "@remix-validated-form/with-yup";
import { ActionFunction, json, useActionData } from "remix";
import { useFormContext, ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

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
  const {
    action,
    hasBeenSubmitted,
    isValid,
    fieldErrors,
    defaultValues,
    touchedFields,
    getValues,
  } = useFormContext(form);

  return (
    <div data-testid={testid}>
      <dl>
        <dt>hasBeenSubmitted</dt>
        <dd>{hasBeenSubmitted ? "true" : "false"}</dd>

        <dt>isValid</dt>
        <dd>{isValid ? "true" : "false"}</dd>

        <dt>action</dt>
        <dd>{action}</dd>

        <dt>fieldErrors</dt>
        <dd>
          <pre>{JSON.stringify(fieldErrors)}</pre>
        </dd>

        <dt>defaultValues</dt>
        <dd>
          <pre>{JSON.stringify(defaultValues)}</pre>
        </dd>

        <dt>touchedFields</dt>
        <dd>
          <pre>{JSON.stringify(touchedFields)}</pre>
        </dd>

        <dt>getValues</dt>
        <dd>
          <pre>{JSON.stringify(Object.fromEntries(getValues()))}</pre>
        </dd>
      </dl>
    </div>
  );
};

export default function FrontendValidation() {
  const actionData = useActionData();

  // Verify we don't get an infinite loop
  useFormContext("test-form");

  return (
    <>
      {actionData?.message && <h1>{actionData.message}</h1>}
      <DisplayContext testid="external-values" form="test-form" />
      <ValidatedForm
        validator={withYup(
          yup.object({
            firstName: yup.string().label("First Name").required(),
          })
        )}
        method="post"
        id="test-form"
        action="/context-hooks"
        defaultValues={{ firstName: "defaultFirstName" }}
      >
        <Input name="firstName" label="First Name" />
        <DisplayContext testid="internal-values" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
