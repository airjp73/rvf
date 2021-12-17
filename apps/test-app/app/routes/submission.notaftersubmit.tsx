import { useRef } from "react";
import { ActionFunction, json } from "remix";
import { ValidatedForm, withYup } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});
const validator = withYup(schema);

export const action: ActionFunction = async () => {
  return json({ message: "Submitted!" });
};

export default function FrontendValidation() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <ValidatedForm validator={validator} method="post">
      <Input name="testinput" label="Test input" ref={inputRef} />
      <SubmitButton label="Submit" submittingLabel="Submitting" />
    </ValidatedForm>
  );
}
