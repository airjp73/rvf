import { withYup } from "@remix-validated-form/with-yup";
import { ActionFunction, json } from "remix";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});
const validator = withYup(schema);

export const action: ActionFunction = async () =>
  json({ message: "Submitted to in-route action." });

export default function FrontendValidation() {
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      action="/submission/action/target"
    >
      <SubmitButton />
    </ValidatedForm>
  );
}
