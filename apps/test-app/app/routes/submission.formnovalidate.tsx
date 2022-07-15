import { withYup } from "@remix-validated-form/with-yup";
import { json, ActionFunction, useActionData } from "remix";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withYup(
  yup.object({
    text1: yup.string().required(),
  })
);

export type LoaderData = {
  method: string;
};

export const action: ActionFunction = async ({ request }) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return json<LoaderData>({
    method: request.method,
  });
};

export default function FrontendValidation() {
  const data = useActionData();
  return (
    <ValidatedForm validator={validator} method="post" id="test-form">
      <code>{JSON.stringify(data)}</code>
      <Input name="text1" type="text" label="Text 1" />
      <SubmitButton name="submitter" label="Submit" formNoValidate={true} />
    </ValidatedForm>
  );
}
