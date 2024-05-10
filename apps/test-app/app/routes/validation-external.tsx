import { withZod } from "@rvf/zod";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  zfd.formData({
    text1: zfd.text(
      z.string({
        required_error: "Text 1 is a required field",
      }),
    ),
    text2: zfd.text(),
  }),
);

export default function FrontendValidation() {
  return (
    <>
      <Input name="text1" type="text" form="test-form" label="Text 1" />
      <ValidatedForm validator={validator} method="post" id="test-form">
        <Input name="text2" type="text" label="Text 2" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
