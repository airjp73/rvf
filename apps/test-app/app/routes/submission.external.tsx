import { withZod } from "@remix-validated-form/with-zod";
import { ActionFunction, json, useActionData } from "remix";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { InputWithTouched } from "~/components/InputWithTouched";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  z.object({
    mySubmit: z.string(),
  })
);

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  await new Promise((resolve) => setTimeout(resolve, 500));
  return json({ message: `Submitted ${data.get("mySubmit")}` });
};

export default function FrontendValidation() {
  const actionData = useActionData();
  return (
    <>
      {actionData?.message && <h1>{actionData.message}</h1>}
      <SubmitButton form="test-form" name="mySubmit" value="submitVal" />
      <ValidatedForm validator={validator} method="post" id="test-form">
        <InputWithTouched name="firstName" label="First Name" />
        <InputWithTouched name="lastName" label="Last Name" />
        <SubmitButton
          name="mySubmit"
          value="internalVal"
          label="Submit 2"
          submittingLabel="Submitting 2"
        />
      </ValidatedForm>
    </>
  );
}
