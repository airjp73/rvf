import { withYup } from "@remix-validated-form/with-yup";
import { ActionFunction, json, useActionData } from "remix";
import {
  useFormContext,
  ValidatedForm,
  validationError,
} from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";

const schema = yup.object({
  name: yup.string().required(),
});
const validator = withYup(schema);

export const action: ActionFunction = async ({ request }) => {
  const result = await validator.validate(await request.formData());
  if (result.error)
    return validationError({ fieldErrors: { name: "Submitted invalid form" } });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  return json({ message: `Submitted by ${result.data.name}` });
};

export default function FrontendValidation() {
  const { submit } = useFormContext("test-form");
  const data = useActionData();
  return (
    <>
      {data && <h1>{data.message}</h1>}
      <ValidatedForm validator={validator} method="post" id="test-form">
        <Input name="name" label="Name" />
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
