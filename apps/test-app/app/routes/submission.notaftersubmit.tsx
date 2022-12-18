import { DataFunctionArgs, json } from "@remix-run/node";
import { withYup } from "@remix-validated-form/with-yup";
import { useRef } from "react";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});
const validator = withYup(schema);

export const action = async (args: DataFunctionArgs) => {
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
