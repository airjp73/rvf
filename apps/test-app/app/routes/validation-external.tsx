import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  zfd.formData({
    text1: zfd.text(),
    text2: zfd.text(),
  })
);

export default function FrontendValidation() {
  return (
    <>
      <label>
        Text 1
        <input name="text1" type="text" form="test-form" />
      </label>
      <ValidatedForm validator={validator} method="post" id="test-form">
        <Input name="text2" type="text" label="Text 2" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
