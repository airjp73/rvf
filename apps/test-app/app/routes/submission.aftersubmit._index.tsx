import { DataFunctionArgs, json } from "@remix-run/node";
import { withYup } from "@rvf/yup";
import { useRef } from "react";
import { ValidatedForm, validationError } from "@rvf/remix";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({
  testinput: yup.string(),
  anotherinput: yup.string(),
});
const validator = withYup(schema);

export const action = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();

  // Perform this check without the validator
  // because the validator would stop the submission on the frontend
  const testinput = formData.get("testinput");
  if (testinput === "fail")
    return validationError({
      fieldErrors: {
        testinput: "Don't say that",
      },
    });

  return json({ message: "Submitted!" });
};

export default function FrontendValidation() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <ValidatedForm
        formId="adf"
        validator={validator}
        method="post"
        resetAfterSubmit
      >
        <Input name="testinput" label="Test input" ref={inputRef} />
        <SubmitButton label="Submit" submittingLabel="Submitting" />
      </ValidatedForm>
      <ValidatedForm
        validator={validator}
        method="post"
        resetAfterSubmit
        subaction="another-action"
      >
        <Input name="anotherinput" label="Another input" ref={inputRef} />
        <SubmitButton label="Other Submit" submittingLabel="Submitting" />
      </ValidatedForm>
    </>
  );
}
