import { ActionFunction, json, useActionData } from "remix";
import { ValidatedForm, withYup } from "remix-validated-form";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});
const validator = withYup(schema);

export const action: ActionFunction = async ({ request }) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const formData = await request.formData();
  const subaction = formData.get("subaction");
  if (subaction === "action1") return json({ message: "Submitted form 1" });
  if (subaction === "action2") return json({ message: "Submitted form 2" });
  return json({ message: "Submitted form 3" });
};

export default function SubactionSubmissions() {
  const actionData = useActionData();
  return (
    <>
      <p>{actionData?.message}</p>
      <ValidatedForm validator={validator} method="post" subaction="action1">
        <SubmitButton
          label="Submit form 1"
          submittingLabel="Submitting form 1"
        />
      </ValidatedForm>
      <ValidatedForm validator={validator} method="post" subaction="action2">
        <SubmitButton
          label="Submit form 2"
          submittingLabel="Submitting form 2"
        />
      </ValidatedForm>
      {/* This one doesn't have a subaction on purpose */}
      <ValidatedForm validator={validator} method="post">
        <SubmitButton
          label="Submit form 3"
          submittingLabel="Submitting form 3"
        />
      </ValidatedForm>
    </>
  );
}
