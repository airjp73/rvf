import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  zfd.formData({
    text1: zfd.text(),
    text2: zfd.text(),
    check1: zfd.checkbox(),
  })
);

export default function FrontendValidation() {
  return (
    <>
      <Input name="text1" type="text" form="test-form" label="Text 1" />
      <Input name="check1" type="checkbox" form="test-form" label="Check 1" />
      <hr />
      <ValidatedForm
        validator={validator}
        method="post"
        id="test-form"
        defaultValues={{
          text1: "John",
          text2: "Bob",
          check1: true,
        }}
      >
        <Input name="text2" type="text" label="Text 2" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
