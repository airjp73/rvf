import { useRef } from "react";
import { ActionFunction, json } from "remix";
import { ValidatedForm, validationError, withYup } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});
const validator = withYup(schema);

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  // Check this check without the validator
  // because the validator would stop the submission on the frontend
  const testinput = formData.get("testinput");
  if (!testinput) return validationError({ testinput: "Required" });

  return json({ message: "Submitted!" });
};

export default function FrontendValidation() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      onAfterSubmit={(data) => {
        // Doing something silly like this instead of something reasonable like resetting the form
        // because its _very_ unlikely we'll ever do this automatically.
        // We will probably never reset the form automatically either, but it's more likely than this.
        inputRef.current!.value = data.message;
      }}
    >
      <Input name="testinput" label="Test input" ref={inputRef} />
      <SubmitButton label="Submit" submittingLabel="Submitting" />
    </ValidatedForm>
  );
}
