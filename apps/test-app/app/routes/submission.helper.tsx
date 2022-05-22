import { withYup } from "@remix-validated-form/with-yup";
import { ActionFunction, json, useActionData } from "remix";
import { useFormContext, ValidatedForm } from "remix-validated-form";
import * as yup from "yup";

const schema = yup.object({});
const validator = withYup(schema);

export const action: ActionFunction = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return json({ message: "Submitted!" });
};

export default function FrontendValidation() {
  const { submit } = useFormContext("test-form");
  const data = useActionData();
  return (
    <>
      {data && <h1>{data.message}</h1>}
      <ValidatedForm validator={validator} method="post" id="test-form">
        <button
          type="button"
          onClick={() => {
            submit();
          }}
        >
          Submit with helper
        </button>
      </ValidatedForm>
    </>
  );
}
