import { withYup } from "@remix-validated-form/with-yup";
import { ActionFunction, json, useActionData } from "remix";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});
const validator = withYup(schema);

export const action: ActionFunction = ({ request }) =>
  json({ message: `Submitted with method ${request.method.toUpperCase()}` });

export default function FrontendValidation() {
  const data = useActionData();

  return (
    <ValidatedForm validator={validator} method="patch">
      {data?.message && <p>{data.message}</p>}
      <SubmitButton />
    </ValidatedForm>
  );
}
