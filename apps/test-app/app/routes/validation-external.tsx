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
      <Input name="text1" type="text" label="Text 1" form="test-form" />
      <ValidatedForm validator={validator} method="post" id="test-form">
        <Input name="text2" type="text" label="Text 2" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
